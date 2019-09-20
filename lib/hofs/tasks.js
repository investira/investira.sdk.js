const { toDate } = require('../utils/dates');
const { isObject } = require('../utils/validators');

const STATUS = Object.freeze({
    STOPPED: 0,
    RUNNING: 1,
    SCHEDULED: 2
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
    this.afterStop =
        pSource.afterStop ||
        function() {
            return Promise.resolve();
        };
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
            return this.beforeRun()
                .then((pIsOk = true) => {
                    if (pIsOk) {
                        this.state.status = STATUS.RUNNING;
                        this.state.startedAt =
                            (pPreviousTaskState && pPreviousTaskState.startedAt) || toDate().getTime();
                        return this.execute();
                    } else {
                        return null;
                    }
                })
                .then(rResult => {
                    this.state.error = null;
                    this.stop();
                    pResolve(rResult);
                })
                .catch(rErr => {
                    let xError = rErr.detail || rErr.stack || rErr.message || rErr;
                    if (isObject(xError)) {
                        xError = JSON.stringify(xError);
                    }
                    this.state.error = xError;

                    this.stop();
                    if (this.restarts < this.options.retries) {
                        this.restarts++;
                        return this.run().catch(rErr => {
                            return pReject(rErr);
                        });
                    } else {
                        return pReject(rErr);
                    }
                });
        });
    };

    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    this.stop = () => {
        if (this.state.status !== STATUS.RUNNING) {
            return Promise.resolve();
        }
        this.state.status = STATUS.STOPPED;
        this.state.endedAt = toDate().getTime();
        this.state.duration = this.state.endedAt - this.state.startedAt;
        return this.afterStop();
    };
}

module.exports = task;
