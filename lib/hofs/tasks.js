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
            return true;
        };
    this.execute = pSource.execute || Promise.resolve();
    this.afterStop = pSource.afterStop || function() {};
    this.state = { status: STATUS.STOPPED, nextTime: null };
    /**
     * Inicia a execução da tarefa.
     * Se tiver sido agendada, inicia o agendamento
     *
     * @returns {Promise}
     */
    this.run = () => {
        return new Promise((pResolve, pReject) => {
            if (this.state.status === STATUS.RUNNING) {
                return pReject(false);
            }
            if (!this.beforeRun()) {
                return pReject(false);
            }
            this.state.status = STATUS.RUNNING;
            return this.execute()
                .then(rResult => {
                    console.log('tasks stop');
                    this.stop();
                    pResolve(rResult);
                })
                .catch(rErr => {
                    this.stop();
                    pReject(rErr);
                });
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
        this.state.status = STATUS.STOPPED;
        this.afterStop();
    };
}

module.exports = task;
