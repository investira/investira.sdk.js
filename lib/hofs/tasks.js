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
    this.STATUS = STATUS;
    this.options = {
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
    // console.log(`*-* INICIO ${this.options.id}`);
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
        // console.log(`${this.options.id} ${this.options.name} *-* SCHEDULE(#1)`);
        if (!this.options.enabled) {
            return;
        }
        //Configura schedule inicial
        if (pvSetNextDate()) {
            clearTimeout(this.timeout);
            // console.log(`${this.options.id} ${this.options.name} *-* SCHEDULE(#2) ${this.state.nextAt}`);
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
        // console.log(`${this.options.id} ${this.options.name} *-* RUN`);
        if (!this.options.enabled || this.isRunning()) {
            if (this.isRunning()) {
                // console.log(`${this.options.id} ${this.options.name} *-* RUN  JÁ EM EXECUÇÃO`);
                this.event.emit('running', true);
            } else {
                // console.log(`${this.options.id} ${this.options.name} *-* RUN DESABILITADA`);
            }
            return Promise.resolve();
        }
        return new Promise((pResolve, pReject) => {
            //Códigos referentes a execução devem ser inseridos dentro da função executada no setTimeout
            //Se for retry, aguarda o tempo definido no delay
            // console.log(`${this.options.id} ${this.options.name} *-* RUN SETTIMEOUT`);

            setTimeout(
                () => {
                    // console.log(`${this.options.id} ${this.options.name} *-* RUN SETTIMEOUT RUN`);
                    //Inicia execução
                    //Reseta erro
                    this.state.error = null;
                    //Dispara evento run
                    this.event.emit('run');
                    //Verica se é para prosseguir
                    this.beforeRun()
                        .then((pIsOk = true) => {
                            // console.log(`${this.options.id} ${this.options.name} *-* RUN BEFORE`);
                            if (pIsOk) {
                                this.state.status = STATUS.RUNNING;
                                //Considera o inicio informado
                                this.state.startedAt = (pPreviousTaskState && pPreviousTaskState.startedAt) || toDate();
                                //Dispara evento disabled
                                this.event.emit('running');
                                //--------------------
                                //      EXECUTA
                                //--------------------
                                // console.log(`${this.options.id} ${this.options.name} *-* RUN EXECUTE`);
                                return this.execute();
                            } else {
                                return null;
                            }
                        })
                        //Sucesso
                        .then(rResult => {
                            //Reseta retries quando execução finalizar com sucesso
                            this.state.retries = 0;
                            // console.log(`${this.options.id} ${this.options.name} *-* RUN SUCESSO`);
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
                            // console.log(`${this.options.id} ${this.options.name} *-* RUN ERRO`);
                            this.state.error = rErr;
                            //Finaliza execução
                            return pvStop().finally(() => {
                                // console.log(`${this.options.id} ${this.options.name} *-* RUN FINALLY`);
                                //Verifica se fará novas tentativas 'Manual Stop'
                                if (this.state.retries < this.options.retries) {
                                    this.state.retries++;
                                    //Dispara evento retry
                                    this.event.emit('retry', this.state.retries);
                                    //Faz novas tentativas
                                    // console.log(`${this.options.id} ${this.options.name} *-* RUN RETRY`);
                                    return this.run().catch(rErr => {
                                        //Dispara evento error
                                        this.event.emit('error', {
                                            err: rErr,
                                            state: this.state,
                                            options: this.options
                                        });
                                        return pReject(rErr);
                                    });
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
        // console.log(`${this.options.id} ${this.options.name} *-* getNextDate(#1)`);
        if (!this.options.schedules || !isArray(this.options.schedules) || this.options.schedules.length === 0) {
            return null;
        }
        // console.log(`${this.options.id} ${this.options.name} *-* getNextDate(#2)`);
        let xNextDate = null;
        //Pesquisa qual a data mais próximas considerando todos os agendamentos
        for (const xSchedule of this.options.schedules) {
            if (xSchedule.type && isObject(xSchedule)) {
                //Calcula próxima data
                const xDate = scheduleToDate(xSchedule, pBaseDate);
                // console.log(`${this.options.id} ${this.options.name} *-* getNextDate(#3) ${xDate}`);
                if (!xNextDate || xDate < xNextDate) {
                    xNextDate = xDate;
                }
            }
        }
        // console.log(`${this.options.id} ${this.options.name} *-* getNextDate(#4) ${xNextDate}`);
        return xNextDate;
    };
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    const pvStop = () => {
        // console.log(`${this.options.id} ${this.options.name} *-* STOP`);
        if (this.state.status !== STATUS.RUNNING && this.state.status !== STATUS.STOPPING) {
            return Promise.resolve();
        }
        // console.log(`${this.options.id} ${this.options.name} *-* STOPPED`);
        this.state.status = STATUS.STOPPED;
        this.state.endedAt = toDate();
        this.state.duration = this.state.endedAt.getTime() - this.state.startedAt.getTime();
        //Dispara evento stopped
        this.event.emit('stopped', this.state.error);
        //Inicia novo schedule, se houver
        this.schedule();
        //Chama afterStop
        return this.afterStop();
        // return this.afterStop().then(() => {
        //     return this.schedule();
        // });
    };

    const pvSetNextDate = () => {
        // console.log(`${this.options.id} ${this.options.name} *-* setNextDate(#1)`);
        const xNextDate = this.getNextDate();
        // console.log(`${this.options.id} ${this.options.name} *-* setNextDate(#2) ${xNextDate} ${this.state.nextAt}`);
        if (!xNextDate || (this.state.nextAt && xNextDate.getTime() === this.state.nextAt.getTime())) {
            return false;
        }
        // console.log(`${this.options.id} ${this.options.name} *-* setNextDate(#3)`);
        this.state.nextAt = xNextDate;
        return true;
    };

    //Inicia schedule de houver
    setTimeout(() => {
        this.schedule();
    }, 0);
}

module.exports = task;
