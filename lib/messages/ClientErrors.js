const { BasicMessageError } = require('./BasicMessages');

class BadRequestError extends BasicMessageError {
    /**
     *
     * Servidor não entendeu a requisição pois dados não são válidos ou não existem.
     * @param {string} [pMessage='Bad Request']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Bad Request', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 400 } });
    }
}

class UnauthorizedError extends BasicMessageError {
    /**
     * Não autenticado
     * @param {string} [pMessage='Unauthorized']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Unauthenticated', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 401 } });
    }
}

class PaymentRequiredError extends BasicMessageError {
    /**
     * Pagamento requerido
     * @param {string} [pMessage='Payment Required']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Payment Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 402 } });
    }
}

class ForbiddenError extends BasicMessageError {
    /**
     * O cliente não tem direitos de acesso ao conteúdo.
     * Diferente do código 401, aqui a identidade do cliente é conhecida.
     * @param {string} [pMessage='Forbidden']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Forbidden', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 403 } });
    }
}

class NotFoundError extends BasicMessageError {
    /**
     * Não existe no servidor o recurso/serviço solicitado.
     * Quando o recurso existir, mas o dado pesquisado, não, deve-se utilizar o BadRequestError
     * @param {string} [pMessage='Not found']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Not found', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 404 } });
    }
}

class MethodNotAllowedError extends BasicMessageError {
    /**
     * O método de solicitação é conhecido pelo servidor, mas foi desativado e não pode ser usado.
     * @param {string} [pMessage='Method Not Allowed']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Method Not Allowed', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 405 } });
    }
}

class NotAcceptableError extends BasicMessageError {
    /**
     * Não é aceita a forma de solicitação do recurso forme seu METHOD ou ACCEPT's de cabeçalho enviado pelo client
     * @param {string} [pMessage='Not Acceptable']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Not Acceptable', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 406 } });
    }
}

class ProxyAuthenticationRequiredError extends BasicMessageError {
    /**
     * Semelhante ao 401 porem é necessário que a autenticação seja feita por um proxy.
     * @param {string} [pMessage='Proxy Authentication Required']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Proxy Authentication Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 407 } });
    }
}

class RequestTimeoutError extends BasicMessageError {
    /**
     * Servidor gostaria de derrubar esta conexão em desuso.
     * @param {string} [pMessage='Request Timeout']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Request Timeout', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 408 } });
    }
}

class ConflictError extends BasicMessageError {
    /**
     * Requisição está conflitando com o estado corrente do servidor.
     * @param {string} [pMessage='Conflict']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Conflict', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 409 } });
    }
}

class GoneError extends BasicMessageError {
    /**
     * Esta resposta será enviada quando o conteúdo requisitado foi deletado do servidor
     * @param {string} [pMessage='Gone']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Gone', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 410 } });
    }
}

class LengthRequiredError extends BasicMessageError {
    /**
     * Campo Content-Length do cabeçalho não foi definido.
     * @param {string} [pMessage='Length Required']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Length Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 411 } });
    }
}

class PreconditionFailedError extends BasicMessageError {
    /**
     * O cliente indicou nos seus cabeçalhos pré-condições que o servidor não atende
     * @param {string} [pMessage='Precondition Failed']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Precondition Failed', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 412 } });
    }
}

class PayloadTooLargeError extends BasicMessageError {
    /**
     * A entidade requisição é maior do que os limites definidos pelo servidor;
     * o servidor pode fechar a conexão ou retornar um campo de cabeçalho Retry-After.
     * @param {string} [pMessage='Payload Too Large']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Payload Too Large', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 413 } });
    }
}

class URITooLongError extends BasicMessageError {
    /**
     * A URI requisitada pelo cliente é maior do que o servidor aceita para interpretar.
     * @param {string} [pMessage='URI Too Long']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'URI Too Long', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 414 } });
    }
}

class UnsupportedMediaTypeError extends BasicMessageError {
    /**
     * O formato de mídia dos dados requisitados não é suportado pelo servidor.
     * @param {string} [pMessage='Unsupported Media Type']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Unsupported Media Type', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 415 } });
    }
}

class RequestedRangeNotSatisfiableError extends BasicMessageError {
    /**
     * O trecho especificado pelo campo Range do cabeçalho na requisição não pode ser preenchido;
     * é possível que o trecho esteja fora do tamanho dos dados da URI alvo.
     * @param {string} [pMessage='Requested Range Not Satisfiable']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Requested Range Not Satisfiable', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 416 } });
    }
}

class ExpectationFailedError extends BasicMessageError {
    /**
     * Expectativa indicada pelo campo Expect do cabeçalho da requisição não pode ser satisfeita pelo servidor.
     * @param {string} [pMessage='Expectation Failed']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Expectation Failed', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 417 } });
    }
}

class ImATeapotError extends BasicMessageError {
    /**
     * O servidor recusa a tentativa de coar café num bule de chá.
     * @param {string} [pMessage="I'm a teapot"]
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = "I'm a teapot", pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 418 } });
    }
}

class MisdirectedRequestError extends BasicMessageError {
    /**
     * A requisição foi direcionada a um servidor inapto a produzir a resposta.
     * Pode ser enviado por um servidor que não está configurado para produzir respostas para a combinação de esquema ("scheme") e autoridade inclusas na URI da requisição
     * @param {string} [pMessage='Misdirected Request']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Misdirected Request', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 421 } });
    }
}

class UnprocessableEntityError extends BasicMessageError {
    /**
     * A requisição está bem formada, mas inabilitada para ser seguida devido a erros semânticos.
     * @param {string} [pMessage='Unprocessable Entity']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Unprocessable Entity', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 422 } });
    }
}

class LockedError extends BasicMessageError {
    /**
     * O recurso solicitado está trancado
     * @param {string} [pMessage='Locked']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Locked', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 423 } });
    }
}

class FailedDependencyError extends BasicMessageError {
    /**
     * A requisição falhou devido a falha em requisição prévia.
     * @param {string} [pMessage='Failed Dependency']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Failed Dependency', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 424 } });
    }
}

class UpgradeRequiredError extends BasicMessageError {
    /**
     * O servidor se recusa a executar a requisição usando o protocolo enviado,
     * mas estará pronto a fazê-lo após o cliente atualizar para um protocolo diferente.
     * O servidor envia um cabeçalho Upgrade numa resposta 426 para indicar o(s) protocolo(s) requeridos.
     * @param {string} [pMessage='Upgrade Required']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Upgrade Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 426 } });
    }
}

class PreconditionRequiredError extends BasicMessageError {
    /**
     * O servidor de origem requer que a resposta seja condicional.
     * Feito para prevenir o problema da 'atualização perdida', onde um cliente pega o estado de um recurso (GET),
     * modifica-o, e o põe de volta no servidor (PUT), enquanto um terceiro modificou o estado no servidor, levando a um conflito.
     * @param {string} [pMessage='Precondition Required']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Precondition Required', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 428 } });
    }
}

class TooManyRequestsError extends BasicMessageError {
    /**
     * O usuário enviou muitas requisições num dado tempo.
     * @param {string} [pMessage='Too Many Requests']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Too Many Requests', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 429 } });
    }
}

class RequestHeaderFieldsTooLargeError extends BasicMessageError {
    /**
     * Os campos de cabeçalho estão muito grandes.
     * @param {string} [pMessage='Request Header Fields Too Large']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Request Header Fields Too Large', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 431 } });
    }
}

class UnavailableForLegalReasonsError extends BasicMessageError {
    /**
     * O usuário requisitou um recurso indisponível por questões legais.
     * @param {string} [pMessage='Unavailable For Legal Reasons']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Unavailable For Legal Reasons', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 451 } });
    }
}

class RequestCanceled extends BasicMessageError {
    /**
     * O request foi cancelado pelo usuário.
     * @param {string} [pMessage='Request Canceled']
     * @param {object} [pProps={}] Código do {source, ref}
     */
    constructor(pMessage = 'Request Canceled', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 404 } });
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    PaymentRequiredError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    NotAcceptableError,
    ProxyAuthenticationRequiredError,
    RequestTimeoutError,
    ConflictError,
    GoneError,
    LengthRequiredError,
    PreconditionFailedError,
    PayloadTooLargeError,
    URITooLongError,
    UnsupportedMediaTypeError,
    RequestedRangeNotSatisfiableError,
    ExpectationFailedError,
    ImATeapotError,
    MisdirectedRequestError,
    UnprocessableEntityError,
    LockedError,
    FailedDependencyError,
    UpgradeRequiredError,
    PreconditionRequiredError,
    TooManyRequestsError,
    RequestHeaderFieldsTooLargeError,
    UnavailableForLegalReasonsError,
    RequestCanceled
};
