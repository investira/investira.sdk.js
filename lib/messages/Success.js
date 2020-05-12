const { BasicMessageSuccess } = require('./BasicMessages');

class OkMessage extends BasicMessageSuccess {
    /**
     * Requisição foi bem sucedida
     * @param {string} [pMessage='Ok']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Success', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 200 } });
    }
}

class CreatedMessage extends BasicMessageSuccess {
    /**
     * Novo recurso foi criado como resultado.
     * Esta é uma tipica resposta enviada após uma requisição PUT.
     * @param {string} [pMessage='Created']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Created', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 201 } });
    }
}

class AcceptedMessage extends BasicMessageSuccess {
    /**
     * A requisição foi recebida mas nenhuma ação foi tomada sobre ela.
     * Isto é uma requisição não-comprometedora, o que significa que não há nenhuma maneira no
     * HTTP para enviar uma resposta assíncrona indicando o resultado do processamento da solicitação.
     * Isto é indicado para casos onde outro processo ou servidor lida com a requisição, ou para processamento em lote.
     * @param {string} [pMessage='Accepted']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Accepted', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 202 } });
    }
}

class NonAuthoritativeInformationMessage extends BasicMessageSuccess {
    /**
     * O conjunto de meta-informações retornadas não é o conjunto exato disponível no servidor de origem,
     * mas coletado de uma cópia local ou de terceiros.
     * Exceto essa condição, a resposta de 200 OK deve ser preferida em vez dessa resposta.
     * @param {string} [pMessage='Non-Authoritative Information']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Non-Authoritative Information', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 203 } });
    }
}

class NoContentMessage extends BasicMessageSuccess {
    /**
     * Não há conteúdo para enviar para esta solicitação, mas os cabeçalhos podem ser úteis.
     * O user-agent pode atualizar seus cabeçalhos em cache para este recurso com os novos.
     * @param {string} [pMessage='No Content']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'No Content', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 204 } });
    }
}

class ResetContentMessage extends BasicMessageSuccess {
    /**
     * Esta requisição é enviada após realizanda a solicitação para informar ao user agent
     * redefinir a visualização do documento que enviou essa solicitação.
     * @param {string} [pMessage='Reset Content']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Reset Content', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 205 } });
    }
}

class PartialContentMessage extends BasicMessageSuccess {
    /**
     * Esta resposta é usada por causa do cabeçalho de intervalo enviado pelo cliente para separar o download em vários fluxos.
     * @param {string} [pMessage='Partial Content']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Partial Content', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 206 } });
    }
}

module.exports = {
    OkMessage,
    CreatedMessage,
    AcceptedMessage,
    NonAuthoritativeInformationMessage,
    NoContentMessage,
    ResetContentMessage,
    PartialContentMessage
};
