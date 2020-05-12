const { BasicMessageError } = require('./BasicMessages');

class InternalServerError extends BasicMessageError {
    /**
     * O servidor encontrou uma situação com a qual não sabe lidar.
     * @param {string} [pMessage='Internal Server Error']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Internal Server Error', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 500 } });
    }
}

class NotImplementedError extends BasicMessageError {
    /**
     * O método da requisição não é suportado pelo servidor e não pode ser manipulado.
     * Os únicos métodos exigidos que servidores suportem (e portanto não devem retornar este código) são GET e HEAD.
     * @param {string} [pMessage='Not Implemented']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Not Implemented', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 501 } });
    }
}

class BadGatewayError extends BasicMessageError {
    /**
     * Erro na conexão entre servidores
     * @param {string} [pMessage='Bad Gateway']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Bad Gateway', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 502 } });
    }
}

class ServiceUnavailableError extends BasicMessageError {
    /**
     * O servidor não está pronto para manipular a requisição.
     * Causas comuns são um servidor em manutenção ou sobrecarregado. Note que junto a esta resposta,
     * uma página amigável explicando o problema deveria ser enviada.
     * Estas respostas devem ser usadas para condições temporárias
     *  e o cabeçalho HTTP Retry-After: deverá, se posível, conter o tempo estimado para recuperação do serviço.
     * O webmaster deve também tomar cuidado com os cabaçalhos relacionados com o cache que são enviados com esta resposta,
     * já que estas respostas de condições temporárias normalmente não deveriam ser postas em cache
     * @param {string} [pMessage='Service Unavailable']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Service Unavailable', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 503 } });
    }
}

class GatewayTimeoutError extends BasicMessageError {
    /**
     * Erro de timeout na conexão entre servidores
     * @param {string} [pMessage='Gateway Timeout']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Gateway Timeout', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 504 } });
    }
}

class HTTPVersionNotSupportedError extends BasicMessageError {
    /**
     * A versão HTTP usada na requisição não é suportada pelo servidor.
     * @param {string} [pMessage='HTTP Version Not Supported']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'HTTP Version Not Supported', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 505 } });
    }
}

/**
 * O cliente precisa se autenticar para ganhar acesso à rede interna.
 *
 * @class NetworkAuthenticationRequiredError
 * @extends {BasicMessageError}
 * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
 */
class NetworkAuthenticationRequiredError extends BasicMessageError {
    /**
     * O cliente precisa se autenticar para ganhar acesso à rede interna.
     * @param {string} [pMessage='Network Authentication Required']
     */
    constructor(pMessage = 'Network Authentication Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 511 } });
    }
}

class NoResponse extends BasicMessageError {
    /**
     * O servidor encontrou uma situação com a qual não sabe lidar.
     * @param {string} [pMessage='Internal Server Error']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'No Response', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 500 } });
    }
}

module.exports = {
    InternalServerError,
    NotImplementedError,
    BadGatewayError,
    ServiceUnavailableError,
    GatewayTimeoutError,
    HTTPVersionNotSupportedError,
    NetworkAuthenticationRequiredError,
    NoResponse
};
// module.exports.Error = class Error extends BasicMessageError {
//     constructor(pMessage = 'NotAcceptable') {
//         super(pMessage, 406);
//     }
// };
