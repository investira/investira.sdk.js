const events = require('events');

const { toDate, schedule, scheduleToDate } = require('../utils/dates');
const { isObject, isArray } = require('../utils/validators');
const { deepCopy } = require('../utils/objects');

/**
 * Status possíveis para uma tarefa
 *
 * @enum {string}
 * @readonly
 * @property {string} STOPPED='S' - Tarefa parada
 * @property {string} STOPPING='T' - Tarefa em processo de parada
 * @property {string} RUNNING='R' - Tarefa em execução
 */
const STATUS = Object.freeze({
    STOPPED: 'S',
    STOPPING: 'T',
    RUNNING: 'R'
});

/**
 * Cria uma tarefa com suporte a agendamento e controle de execução
 *
 * @description
 * Esta função cria uma tarefa que pode ser agendada para execução em horários específicos.
 * Suporta múltiplos agendamentos, retentativas em caso de erro e eventos para monitoramento.
 *
 * @param {object} pOptions Opções de configuração da tarefa
 * @param {string} pOptions.id Identificador único da tarefa
 * @param {string} pOptions.name Nome descritivo da tarefa
 * @param {number} [pOptions.retries=0] Número de tentativas em caso de erro
 * @param {number} [pOptions.delay=0] Tempo em segundos entre tentativas
 * @param {boolean} [pOptions.enabled=true] Se a tarefa está habilitada
 * @param {object[]} [pOptions.schedules] Lista de agendamentos
 * @param {object} pOptions.schedules.schedule Configuração de um agendamento
 * @param {('D'|'W'|'M'|'Y')} pOptions.schedules.schedule.type Tipo: Dia, Semana, Mês ou Ano
 * @param {string} pOptions.schedules.schedule.time Horário no formato 'HH:mm'
 * @param {(0|1|2|3|4|5|6)} [pOptions.schedules.schedule.weekday] Dia da semana (0=Domingo)
 * @param {number} [pOptions.schedules.schedule.day] Dia do mês (1-31)
 * @param {number} [pOptions.schedules.schedule.month] Mês (1-12)
 * @param {boolean} [pOptions.schedules.schedule.workingDay] Considerar apenas dias úteis
 * @param {object} [pSource={}] Objeto com funções de ciclo de vida da tarefa
 * @param {Function} [pSource.beforeRun] Função executada antes do início
 * @param {Function} [pSource.execute] Função principal da tarefa
 * @param {Function} [pSource.afterStop] Função executada após o término
 */
function task(pOptions, pSource = {}) {
    const xSelf = this;
    xSelf.STATUS = STATUS;
    xSelf.options = {
        retries: 0, //Numero de tentativas quando houver erro
        delay: 0, //Tempo em segundos para efetuar nova tentativa
        enabled: true,
        schedules: [
            {
                type: null, //'D'-Dia, 'W'-Semana, 'M'-Mês, 'Y'-Ano
                time: null, //'hh:mm' Hora da execução
                weekday: null, //Número da semana quando type for 'W','M' ou 'Y' , 0-Domingo até 6-sábado.
                day: null, //Dia do mês quando type for 'M'
                month: null, //Número do mês quando type for 'Y'
                workingDay: null //Boolean indicando se cálculo será em dias úteis.
            }
        ], //Array com os agendamentos
        ...deepCopy(pOptions)
    };
    // console.log(`*-* INICIO ${xSelf.options.id}`);
    xSelf.event = new events.EventEmitter();
    xSelf.beforeRun =
        pSource.beforeRun ||
        function () {
            return Promise.resolve();
        };
    xSelf.execute =
        pSource.execute ||
        function () {
            return Promise.resolve();
        };
    xSelf.afterStop =
        pSource.afterStop ||
        function () {
            return Promise.resolve();
        };
    xSelf.state = {
        status: STATUS.STOPPED, //Status da execução
        nextAt: null, //Momento da próxima execução
        startedAt: null, //Momento de inicio da execução
        endedAt: null, //Momento do fim da execução
        retries: 0, //Quantidade de vezes que foi reiniciada
        error: null //Mensagem de erro,
    };
    xSelf.timeout = null;

    /**
     * Desabilita a execução da tarefa
     * Limpa o timeout atual e emite o evento 'disabled'
     */
    xSelf.disable = () => {
        xSelf.options.enabled = false;
        clearTimeout(xSelf.timeout);
        //Dispara evento disabled
        xSelf.event.emit('disabled');
    };
    /**
     * Habilita a execução da tarefa
     * Reinicia o agendamento se houver e emite o evento 'enabled'
     */
    xSelf.enable = () => {
        xSelf.options.enabled = true;
        //Dispara evento scheduled
        xSelf.event.emit('enabled');
        xSelf.schedule();
    };
    /**
     * Agenda a próxima execução da tarefa
     * Se a tarefa estiver habilitada, calcula a próxima data e configura o timeout
     * Emite o evento 'scheduled' com a data da próxima execução
     */
    xSelf.schedule = () => {
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* SCHEDULE(#1)`);
        if (!xSelf.options.enabled) {
            return;
        }
        //Configura schedule inicial
        if (pvSetNextDate()) {
            clearTimeout(xSelf.timeout);
            // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* SCHEDULE(#2) ${xSelf.state.nextAt}`);
            //Efetua agendamento
            xSelf.timeout = schedule(xSelf.state.nextAt, xSelf.run);
            //Dispara evento scheduled
            xSelf.event.emit('scheduled', xSelf.state.nextAt);
        }
    };

    /**
     * Inicia a execução da tarefa
     * Executa o ciclo completo: beforeRun -> execute -> afterStop
     * Gerencia retentativas em caso de erro e emite eventos de progresso
     *
     * @param {object} [pPreviousTaskState=null] Estado de uma tarefa anterior para usar como referência de início
     * @returns {Promise<void>} Promise que resolve quando a tarefa termina ou rejeita em caso de erro
     */
    xSelf.run = (pPreviousTaskState = null) => {
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN`);
        if (!xSelf.options.enabled || xSelf.isRunning()) {
            if (xSelf.isRunning()) {
                // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN  JÁ EM EXECUÇÃO`);
                xSelf.event.emit('running', true);
            } else {
                // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN DESABILITADA`);
            }
            return Promise.resolve();
        }
        return new Promise((pResolve, pReject) => {
            //Códigos referentes a execução devem ser inseridos dentro da função executada no setTimeout
            //Se for retry, aguarda o tempo definido no delay
            // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN SETTIMEOUT`);

            setTimeout(
                () => {
                    // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN SETTIMEOUT RUN`);
                    //Inicia execução
                    //Reseta erro
                    xSelf.state.error = null;
                    //Dispara evento run
                    xSelf.event.emit('run');
                    //Verica se é para prosseguir
                    xSelf
                        .beforeRun()
                        .then((pIsOk = true) => {
                            // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN BEFORE`);
                            if (pIsOk) {
                                // @ts-ignore
                                xSelf.state.status = STATUS.RUNNING;
                                //Considera o inicio informado
                                xSelf.state.startedAt =
                                    (pPreviousTaskState && pPreviousTaskState.startedAt) || toDate();
                                //Dispara evento disabled
                                xSelf.event.emit('running');
                                //--------------------
                                //      EXECUTA
                                //--------------------
                                // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN EXECUTE`);
                                return xSelf.execute();
                            } else {
                                return null;
                            }
                        })
                        //Sucesso
                        .then(rResult => {
                            //Reseta retries quando execução finalizar com sucesso
                            xSelf.state.retries = 0;
                            // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN SUCESSO`);
                            //Finaliza execução
                            return pvStop()
                                .then(() => {
                                    return pResolve(rResult);
                                })
                                .catch(rErr => {
                                    return pReject(rErr);
                                });
                        })
                        //Error
                        .catch(rErr => {
                            // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN ERRO`);
                            xSelf.state.error = rErr;
                            //Finaliza execução
                            return pvStop().finally(() => {
                                // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN FINALLY`);
                                //Verifica se fará novas tentativas 'Manual Stop'
                                if (xSelf.state.retries < xSelf.options.retries) {
                                    xSelf.state.retries++;
                                    //Dispara evento retry
                                    xSelf.event.emit('retry', xSelf.state.retries);
                                    //Faz novas tentativas
                                    // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* RUN RETRY`);
                                    return xSelf.run().catch(rErr => {
                                        //Dispara evento error
                                        xSelf.event.emit('error', {
                                            err: rErr,
                                            state: xSelf.state,
                                            options: xSelf.options
                                        });
                                        return pReject(rErr);
                                    });
                                } else {
                                    //Dispara evento error
                                    xSelf.event.emit('error', {
                                        err: rErr,
                                        state: xSelf.state,
                                        options: xSelf.options
                                    });
                                    return pReject(rErr);
                                }
                            });
                        });
                },
                //Delay para efetuar novo restart
                xSelf.state.retries > 0 ? xSelf.options.delay * 1000 : 0
            );
        });
    };

    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    xSelf.stop = () => {
        // @ts-ignore
        if (xSelf.state.status !== STATUS.RUNNING) {
            return;
        }
        // @ts-ignore
        xSelf.state.status = STATUS.STOPPING;
    };
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    xSelf.isStopping = () => {
        // @ts-ignore
        if (xSelf.state.status !== STATUS.STOPPING) {
            return false;
        }
        //Indica que execução foi parada manualmente
        xSelf.state.error = 'Manual Stop';
        pvStop();
        return true;
    };
    /**
     * Verifica se a tarefa está em execução
     *
     * @returns {boolean} True se o status atual é RUNNING
     */
    xSelf.isRunning = () => {
        // @ts-ignore
        return xSelf.state.status === STATUS.RUNNING;
    };
    /**
     * Calcula a próxima data de execução baseada nos agendamentos
     * Considera todos os agendamentos configurados e retorna a data mais próxima
     *
     * @param {Date} [pBaseDate=null] Data base para o cálculo. Se não informada, usa a data atual
     * @returns {Date|null} Próxima data de execução ou null se não houver agendamentos
     */
    xSelf.getNextDate = (pBaseDate = null) => {
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* getNextDate(#1)`);
        if (!xSelf.options.schedules || !isArray(xSelf.options.schedules) || xSelf.options.schedules.length === 0) {
            return null;
        }
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* getNextDate(#2)`);
        let xNextDate = null;
        //Pesquisa qual a data mais próximas considerando todos os agendamentos
        for (const xSchedule of xSelf.options.schedules) {
            if (xSchedule.type && isObject(xSchedule)) {
                //Calcula próxima data
                const xDate = scheduleToDate(xSchedule, pBaseDate);
                // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* getNextDate(#3) ${xDate}`);
                if (!xNextDate || xDate < xNextDate) {
                    xNextDate = xDate;
                }
            }
        }
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* getNextDate(#4) ${xNextDate}`);
        return xNextDate;
    };
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    const pvStop = () => {
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* STOP`);
        // @ts-ignore
        if (xSelf.state.status !== STATUS.RUNNING && xSelf.state.status !== STATUS.STOPPING) {
            return Promise.resolve();
        }
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* STOPPED`);
        xSelf.state.status = STATUS.STOPPED;
        xSelf.state.endedAt = toDate();
        xSelf.state.duration = xSelf.state.endedAt.getTime() - xSelf.state.startedAt.getTime();
        //Dispara evento stopped
        xSelf.event.emit('stopped', xSelf.state.error);
        //Inicia novo schedule, se houver
        xSelf.schedule();
        //Chama afterStop
        return xSelf.afterStop();
    };

    /**
     * Atualiza a próxima data de execução no estado da tarefa
     *
     * @private
     * @returns {boolean} True se uma nova data foi definida, false se não houve mudança
     */
    const pvSetNextDate = () => {
        const xNextDate = xSelf.getNextDate();
        if (!xNextDate || (xSelf.state.nextAt && xNextDate.getTime() === xSelf.state.nextAt.getTime())) {
            return false;
        }
        xSelf.state.nextAt = xNextDate;
        return true;
    };

    //Inicia schedule de houver
    setTimeout(() => {
        xSelf.schedule();
    }, 0);
}

module.exports = task;
