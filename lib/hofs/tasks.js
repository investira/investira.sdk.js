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
        schedules: [{ type: null, time: null, day: null, weekday: null, month: null }], //Array com os agendamentos
        ...pOptions
    });

    this.beforeRun =
        pSource.beforeRun ||
        function() {
            return Promise.resolve();
        };
    this.execute =
        pSource.execute ||
        function() {
            return Promise.resolve();
        };
    this.afterStop = pSource.afterStop || function() {};
    this.state = {
        status: STATUS.STOPPED, //Status da execução
        nextAt: null, //Momento da próxima execução
        startedAt: null, //Momento de inicio da execução
        endedAt: null, //Momento do fim da execução
        error: null //Mensagem de erro,
    };
    //Quantidade de vezes que foi reiniciada
    this.restarts = 0;
    this.timeout = null;

    /**
     * desabilitar esta tarefa
     */
    this.disable = () => {
        this.options.enabled = false;
        clearTimeout(this.timeout);
    };
    /**
     * Habilitar esta tarefa e reinicia o agendamento se houver
     */
    this.enable = () => {
        this.options.enabled = true;
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
        //Efetua agendamento
        this.timeout = schedule(this.state.nextAt, this.run);
    };

    /**
     * Inicia a execução da tarefa.
     * Se tiver sido agendada, inicia o agendamento
     *
     * @returns {Promise}
     */
    this.run = (pPreviousTaskState = null) => {
        if (!this.options.enabled) {
            return Promise.resolve();
        }
        return new Promise((pResolve, pReject) => {
            if (this.state.status === STATUS.RUNNING) {
                return pReject(false);
            }
            //Reseta erro
            this.state.error = null;
            //Inicia execução
            //Se for retry, aguarda o tempo definido no delay
            setTimeout(
                () => {
                    // return (
                    //Verica se é para prosseguir
                    this.beforeRun()
                        .then((pIsOk = true) => {
                            if (pIsOk) {
                                this.state.status = STATUS.RUNNING;
                                this.state.startedAt =
                                    (pPreviousTaskState && pPreviousTaskState.startedAt) || toDate().getTime();
                                //Executa
                                return this.execute();
                            } else {
                                return null;
                            }
                        })
                        //Sucesso
                        .then(rResult => {
                            //Reseta restart quando execução finalizar com sucesso
                            this.restarts = 0;
                            //Finaliza execução
                            pvStop();
                            pResolve(rResult);
                        })
                        //Error
                        .catch(rErr => {
                            let xError = rErr.detail || rErr.stack || rErr.message || rErr.statusText || rErr;
                            if (isObject(xError)) {
                                xError = JSON.stringify(xError);
                            }
                            this.state.error = xError;
                            //Finaliza execução
                            pvStop();
                            //Verifica se fará novas tentativas 'Manual Stop'
                            if (this.restarts < this.options.retries && this.state.error !== 'Manual Stop') {
                                this.restarts++;
                                //Faz novas tentativas
                                return this.run().catch(rErr => {
                                    return pReject(rErr);
                                });
                            } else {
                                return pReject(rErr);
                            }
                        });
                },
                this.restarts > 0 ? this.options.delay * 1000 : 0
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
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    const pvStop = () => {
        if (this.state.status !== STATUS.RUNNING && this.state.status !== STATUS.STOPPING) {
            return;
        }
        this.state.status = STATUS.STOPPED;
        this.state.endedAt = toDate().getTime();
        this.state.duration = this.state.endedAt - this.state.startedAt;
        this.afterStop();
        //Inicia novo schedule de houver
        this.schedule();
    };

    const pvSetNextDate = () => {
        if (!this.options.schedules || !isArray(this.options.schedules)) {
            return;
        }
        this.state.nextAt = null;
        //Pesquisa qual a data mais próximas considerando todos os agendamentos
        for (const xSchedule of this.options.schedules) {
            if (xSchedule.type && isObject(xSchedule)) {
                //Calcula próxima data
                const xDate = scheduleToDate(xSchedule);
                if (!this.state.nextAt || xDate < this.state.nextAt) {
                    this.state.nextAt = xDate;
                }
            }
        }
    };

    //Inicia schedule de houver
    this.schedule();
}

module.exports = task;
