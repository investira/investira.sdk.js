const events = require('events');

const { toDate, schedule, scheduleToDate } = require('../utils/dates');
const { isObject, isArray } = require('../utils/validators');
const { deepCopy } = require('../utils/objects');

const STATUS = Object.freeze({
    STOPPED: 'S',
    STOPPING: 'T',
    RUNNING: 'R'
});

/**
 * Controle de tarefa com agendamento
 *
 * @param {object} pOptions
 * @param {object} [pSource={}]
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
                weekday: null, //Número da semana quando type for 'W', 0-Domingo até 6-sábado.
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
     * desabilitar esta tarefa
     */
    xSelf.disable = () => {
        xSelf.options.enabled = false;
        clearTimeout(xSelf.timeout);
        //Dispara evento disabled
        xSelf.event.emit('disabled');
    };
    /**
     * Habilitar esta tarefa e reinicia o agendamento se houver
     */
    xSelf.enable = () => {
        xSelf.options.enabled = true;
        //Dispara evento scheduled
        xSelf.event.emit('enabled');
        xSelf.schedule();
    };
    /**
     * Agenda próxima execução
     *
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
     * Inicia a execução da tarefa.
     *
     * @param {object} [pPreviousTaskState=null] Atributo 'state' de uma tarefa anterior para a data/hora ser utilizada como o verdadeiro inicio
     * @returns {Promise}
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
    xSelf.isRunning = () => {
        // @ts-ignore
        return xSelf.state.status === STATUS.RUNNING;
    };
    /**
     * Retorna próxima data considerando a configuração do schedule.
     *
     * @param {Date} [pBaseDate=null] Data base a partir da qual será cálculada a próxima data.
     * 								  Se não informada, será utilizada a data atual
     * @returns {Date}
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

    const pvSetNextDate = () => {
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* setNextDate(#1)`);
        const xNextDate = xSelf.getNextDate();
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* setNextDate(#2) ${xNextDate} ${xSelf.state.nextAt}`);
        if (!xNextDate || (xSelf.state.nextAt && xNextDate.getTime() === xSelf.state.nextAt.getTime())) {
            return false;
        }
        // console.log(`${xSelf.options.id} ${xSelf.options.name} *-* setNextDate(#3)`);
        xSelf.state.nextAt = xNextDate;
        return true;
    };

    //Inicia schedule de houver
    setTimeout(() => {
        xSelf.schedule();
    }, 0);
}

module.exports = task;
