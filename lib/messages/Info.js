const { BasicMessageSuccess } = require('./BasicMessages');

class ContinueMessage extends BasicMessageSuccess {
    /**
     * Reposta provisória indicando que tudo ocorreu bem e que
     * o cliente deve continuar com a requisição ou ignorar se já concluiu o que gostaria.
     * @param {string} [pMessage='Continue']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Continue', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 100 } });
    }
}

class SwitchingProtocolMessage extends BasicMessageSuccess {
    /**
     * Esse código é enviado em resposta a um cabeçalho de solicitação Upgrade pelo cliente,
     * e indica o protocolo a que o servidor está alternando.
     * @param {string} [pMessage='Switching Protocol']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Switching Protocol', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 101 } });
    }
}

module.exports = {
    ContinueMessage,
    SwitchingProtocolMessage
};
