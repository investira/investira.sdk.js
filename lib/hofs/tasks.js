const events = require('events');

const { toDate, schedule, scheduleToDate } = require('../utils/dates');
const { isObject, isArray } = require('../utils/validators');

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
    this.STATUS = STATUS;
    this.options = Object.freeze({
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
        ...pOptions
    });
    this.event = new events.EventEmitter();
    this.beforeRun =
        pSource.beforeRun ||
        function () {
            return Promise.resolve();
        };
    this.execute =
        pSource.execute ||
        function () {
            return Promise.resolve();
        };
    this.afterStop =
        pSource.afterStop ||
        function () {
            return Promise.resolve();
        };
    this.state = {
        status: STATUS.STOPPED, //Status da execução
        nextAt: null, //Momento da próxima execução
        startedAt: null, //Momento de inicio da execução
        endedAt: null, //Momento do fim da execução
        retries: 0, //Quantidade de vezes que foi reiniciada
        error: null //Mensagem de erro,
    };
    this.timeout = null;

    /**
     * desabilitar esta tarefa
     */
    this.disable = () => {
        this.options.enabled = false;
        clearTimeout(this.timeout);
        //Dispara evento disabled
        this.event.emit('disabled');
    };
    /**
     * Habilitar esta tarefa e reinicia o agendamento se houver
     */
    this.enable = () => {
        this.options.enabled = true;
        //Dispara evento scheduled
        this.event.emit('enabled');
        this.schedule();
    };
    /**
     * Agenda próxima execução
     *
     */
    this.schedule = () => {
        if (!this.options.enabled) {
            return;
        }
        //Configura schedule inicial
        pvSetNextDate();
        if (this.state.nextAt) {
            //Efetua agendamento
            this.timeout = schedule(this.state.nextAt, this.run);
            //Dispara evento scheduled
            this.event.emit('scheduled', this.state.nextAt);
        }
    };

    /**
     * Inicia a execução da tarefa.
     *
     * @param {object} [pPreviousTaskState=null] Atributo 'state' de uma tarefa anterior para a data/hora ser utilizada como o verdadeiro inicio
     * @returns {Promise}
     */
    this.run = (pPreviousTaskState = null) => {
        if (!this.options.enabled || this.isRunning()) {
            if (this.isRunning()) {
                this.event.emit('running', true);
            }
            return Promise.resolve();
        }
        return new Promise((pResolve, pReject) => {
            //Códigos referentes a execução devem ser inseridos dentro da função executada no setTimeout
            //Se for retry, aguarda o tempo definido no delay
            setTimeout(
                () => {
                    //Inicia execução
                    //Reseta erro
                    this.state.error = null;
                    //Dispara evento run
                    this.event.emit('run');
                    //Verica se é para prosseguir
                    this.beforeRun()
                        .then((pIsOk = true) => {
                            if (pIsOk) {
                                this.state.status = STATUS.RUNNING;
                                //Considera o inicio informado
                                this.state.startedAt = (pPreviousTaskState && pPreviousTaskState.startedAt) || toDate();
                                //Dispara evento disabled
                                this.event.emit('running');
                                //--------------------
                                //      EXECUTA
                                //--------------------
                                return this.execute();
                            } else {
                                return null;
                            }
                        })
                        //Sucesso
                        .then(rResult => {
                            //Reseta retries quando execução finalizar com sucesso
                            this.state.retries = 0;
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
                            this.state.error = rErr;
                            //Finaliza execução
                            return pvStop().finally(() => {
                                //Verifica se fará novas tentativas 'Manual Stop'
                                if (this.state.retries < this.options.retries) {
                                    this.state.retries++;
                                    //Dispara evento retry
                                    this.event.emit('retry', this.state.retries);
                                    //Faz novas tentativas
                                    setImmediate(this.run.bind(this));
                                } else {
                                    //Dispara evento error
                                    this.event.emit('error', { err: rErr, state: this.state, options: this.options });
                                    return pReject(rErr);
                                }
                            });
                        });
                },
                //Delay para efetuar novo restart
                this.state.retries > 0 ? this.options.delay * 1000 : 0
            );
        });
    };

    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    this.stop = () => {
        if (this.state.status !== STATUS.RUNNING) {
            return;
        }
        this.state.status = STATUS.STOPPING;
    };
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    this.isStopping = () => {
        if (this.state.status !== STATUS.STOPPING) {
            return false;
        }
        //Indica que execução foi parada manualmente
        this.state.error = 'Manual Stop';
        pvStop();
        return true;
    };
    this.isRunning = () => {
        return this.state.status === STATUS.RUNNING;
    };
    /**
     * Retorna próxima data considerando a configuração do schedule.
     *
     * @param {Date} [pBaseDate=null] Data base a partir da qual será cálculada a próxima data.
     * 								  Se não informada, será utilizada a data atual
     * @returns {Date}
     */
    this.getNextDate = (pBaseDate = null) => {
        if (!this.options.schedules || !isArray(this.options.schedules) || this.options.schedules.length === 0) {
            return null;
        }
        let xNextDate = null;
        //Pesquisa qual a data mais próximas considerando todos os agendamentos
        for (const xSchedule of this.options.schedules) {
            if (xSchedule.type && isObject(xSchedule)) {
                //Calcula próxima data
                const xDate = scheduleToDate(xSchedule, pBaseDate);
                if (!xNextDate || xDate < xNextDate) {
                    xNextDate = xDate;
                }
            }
        }
        return xNextDate;
    };
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    const pvStop = () => {
        if (this.state.status !== STATUS.RUNNING && this.state.status !== STATUS.STOPPING) {
            return Promise.resolve();
        }
        this.state.status = STATUS.STOPPED;
        this.state.endedAt = toDate();
        this.state.duration = this.state.endedAt.getTime() - this.state.startedAt.getTime();
        pvSetNextDate();
        //Dispara evento stopped
        this.event.emit('stopped', this.state.error);
        //Chama afterStop
        return this.afterStop().then(() => {
            //Inicia novo schedule, se houver
            return this.schedule();
        });
    };

    const pvSetNextDate = () => {
        this.state.nextAt = this.getNextDate();
    };

    //Inicia schedule de houver
    setTimeout(() => {
        this.schedule();
    }, 0);
}

module.exports = task;
