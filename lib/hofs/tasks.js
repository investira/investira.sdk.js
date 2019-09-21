const { toDate } = require('../utils/dates');
const { isObject } = require('../utils/validators');

const STATUS = Object.freeze({
    STOPPED: 'S',
    STOPPING: 'T',
    RUNNING: 'R',
    SCHEDULED: 'S'
});

/**
 *
 *
 * @param {object} pOptions
 * @param {object} [pSource={}]
 */
function task(pOptions, pSource = {}) {
    this.STATUS = STATUS;
    this.options = Object.freeze({ time: null, retries: 0, ...pOptions });
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
    this.state = { status: STATUS.STOPPED, nextTime: null, startedAt: null, endedAt: null, error: null };
    this.restarts = 0;
    /**
     * Inicia a execução da tarefa.
     * Se tiver sido agendada, inicia o agendamento
     *
     * @returns {Promise}
     */
    this.run = (pPreviousTaskState = null) => {
        return new Promise((pResolve, pReject) => {
            if (this.state.status === STATUS.RUNNING) {
                return pReject(false);
            }
            //Reseta erro
            this.state.error = null;
            return (
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
                        this.state.error = null;
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
                        //Verifica se fará novas tentativas
                        if (this.restarts < this.options.retries) {
                            this.restarts++;
                            //Faz novas tentativas
                            return this.run().catch(rErr => {
                                return pReject(rErr);
                            });
                        } else {
                            return pReject(rErr);
                        }
                    })
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
    };
}

module.exports = task;
