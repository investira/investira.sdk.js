const { toDate, schedule, scheduleToDate } = require('../utils/dates');
const { isObject, isArray } = require('../utils/validators');
const events = require('events');

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
            console.log(`Agendado para ${this.state.nextAt.toLocaleString()}\t${this.options.name}`);
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
                                //Executa
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
                            if (this.state.retries < this.options.retries && this.state.error !== 'Manual Stop') {
                                this.state.retries++;
                                //Dispara evento retry
                                this.event.emit('retry', this.state.retries);
                                console.log(`Retry ${this.state.retries}\t${this.options.name}`);
                                //Faz novas tentativas
                                return this.run().catch(rErr => {
                                    //Dispara evento retry
                                    this.event.emit('error', { err: rErr, state: this.state, options: this.options });
                                    return pReject(rErr);
                                });
                            } else {
                                //Dispara evento retry
                                this.event.emit('error', { err: rErr, state: this.state, options: this.options });
                                return pReject(rErr);
                            }
                        });
                },
                //Tempo para efetuar novo restart
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
    /**
     * Interrompe a execução da tarefa caso tenha sido agendada
     *
     */
    const pvStop = () => {
        if (this.state.status !== STATUS.RUNNING && this.state.status !== STATUS.STOPPING) {
            return;
        }
        this.state.status = STATUS.STOPPED;
        this.state.endedAt = toDate();
        this.state.duration = this.state.endedAt.getTime() - this.state.startedAt.getTime();
        pvSetNextDate();
        //Dispara evento retry
        this.event.emit('stopped', this.state.error);
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
