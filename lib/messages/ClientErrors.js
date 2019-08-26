const { BasicMessageError } = require('./BasicMessages');

class BadRequestError extends BasicMessageError {
    /**
     *
     * Servidor não entendeu a requisição pois dados não são válidos ou não existem.
     * @param {string} [pMessageText='Bad Request']
     * @param {string} [pSource=0] Código da origem do erro
     * @param {string} [pCode=0] Código do erro
     */
    constructor(pMessageText = 'Bad Request', pSource = '0', pCode = '0') {
        super(pMessageText, 400, pSource, pCode);
    }
}

class UnauthorizedError extends BasicMessageError {
    /**
     * Não autenticado
     * @param {string} [pMessageText='Unauthorized']
     * @param {string} [pSource=0] Código da origem do erro
     * @param {string} [pCode=0] Código do erro
     */
    constructor(pMessageText = 'Unauthenticated', pSource = '0', pCode = '0') {
        super(pMessageText, 401, pSource, pCode);
    }
}

class PaymentRequiredError extends BasicMessageError {
    /**
     * Pagamento requerido
     * @param {string} [pMessage='Payment Required']
     */
    constructor(pMessage = 'Payment Required', pSource = '0', pCode = '0') {
        super(pMessage, 402, pSource, pCode);
    }
}

class ForbiddenError extends BasicMessageError {
    /**
     * O cliente não tem direitos de acesso ao conteúdo.
     * Diferente do código 401, aqui a identidade do cliente é conhecida.
     * @param {string} [pMessage='Forbidden']
     */
    constructor(pMessage = 'Forbidden', pSource = '0', pCode = '0') {
        super(pMessage, 403, pSource, pCode);
    }
}

class NotFoundError extends BasicMessageError {
    /**
     * Não existe no servidor o recurso/serviço solicitado.
     * Quando o recurso existir, mas o dado pesquisado, não, deve-se utilizar o BadRequestError
     * @param {string} [pMessage='Not found']
     */
    constructor(pMessage = 'Not found', pSource = '0', pCode = '0') {
        super(pMessage, 404, pSource, pCode);
    }
}

class MethodNotAllowedError extends BasicMessageError {
    /**
     * O método de solicitação é conhecido pelo servidor, mas foi desativado e não pode ser usado.
     * @param {string} [pMessage='Method Not Allowed']
     */
    constructor(pMessage = 'Method Not Allowed', pSource = '0', pCode = '0') {
        super(pMessage, 405, pSource, pCode);
    }
}

class NotAcceptableError extends BasicMessageError {
    /**
     * Não é aceita a forma de solicitação do recurso forme seu METHOD ou ACCEPT's de cabeçalho enviado pelo client
     * @param {string} [pMessage='Not Acceptable']
     */
    constructor(pMessage = 'Not Acceptable', pSource = '0', pCode = '0') {
        super(pMessage, 406, pSource, pCode);
    }
}

class ProxyAuthenticationRequiredError extends BasicMessageError {
    /**
     * Semelhante ao 401 porem é necessário que a autenticação seja feita por um proxy.
     * @param {string} [pMessage='Proxy Authentication Required']
     */
    constructor(pMessage = 'Proxy Authentication Required', pSource = '0', pCode = '0') {
        super(pMessage, 407, pSource, pCode);
    }
}

class RequestTimeoutError extends BasicMessageError {
    /**
     * Servidor gostaria de derrubar esta conexão em desuso.
     * @param {string} [pMessage='Request Timeout']
     */
    constructor(pMessage = 'Request Timeout', pSource = '0', pCode = '0') {
        super(pMessage, 408, pSource, pCode);
    }
}

class ConflictError extends BasicMessageError {
    /**
     * Requisição está conflitando com o estado corrente do servidor.
     * @param {string} [pMessage='Conflict']
     */
    constructor(pMessage = 'Conflict', pSource = '0', pCode = '0') {
        super(pMessage, 409, pSource, pCode);
    }
}

class GoneError extends BasicMessageError {
    /**
     * Esta resposta será enviada quando o conteúdo requisitado foi deletado do servidor
     * @param {string} [pMessage='Gone']
     */
    constructor(pMessage = 'Gone', pSource = '0', pCode = '0') {
        super(pMessage, 410, pSource, pCode);
    }
}

class LengthRequiredError extends BasicMessageError {
    /**
     * Campo Content-Length do cabeçalho não foi definido.
     * @param {string} [pMessage='Length Required']
     */
    constructor(pMessage = 'Length Required', pSource = '0', pCode = '0') {
        super(pMessage, 411, pSource, pCode);
    }
}

class PreconditionFailedError extends BasicMessageError {
    /**
     * O cliente indicou nos seus cabeçalhos pré-condições que o servidor não atende
     * @param {string} [pMessage='Precondition Failed']
     */
    constructor(pMessage = 'Precondition Failed', pSource = '0', pCode = '0') {
        super(pMessage, 412, pSource, pCode);
    }
}

class PayloadTooLargeError extends BasicMessageError {
    /**
     * A entidade requisição é maior do que os limites definidos pelo servidor;
     * o servidor pode fechar a conexão ou retornar um campo de cabeçalho Retry-After.
     * @param {string} [pMessage='Payload Too Large']
     */
    constructor(pMessage = 'Payload Too Large', pSource = '0', pCode = '0') {
        super(pMessage, 413, pSource, pCode);
    }
}

class URITooLongError extends BasicMessageError {
    /**
     * A URI requisitada pelo cliente é maior do que o servidor aceita para interpretar.
     * @param {string} [pMessage='URI Too Long']
     */
    constructor(pMessage = 'URI Too Long', pSource = '0', pCode = '0') {
        super(pMessage, 414, pSource, pCode);
    }
}

class UnsupportedMediaTypeError extends BasicMessageError {
    /**
     * O formato de mídia dos dados requisitados não é suportado pelo servidor.
     * @param {string} [pMessage='Unsupported Media Type']
     */
    constructor(pMessage = 'Unsupported Media Type', pSource = '0', pCode = '0') {
        super(pMessage, 415, pSource, pCode);
    }
}

class RequestedRangeNotSatisfiableError extends BasicMessageError {
    /**
     * O trecho especificado pelo campo Range do cabeçalho na requisição não pode ser preenchido;
     * é possível que o trecho esteja fora do tamanho dos dados da URI alvo.
     * @param {string} [pMessage='Requested Range Not Satisfiable']
     */
    constructor(pMessage = 'Requested Range Not Satisfiable', pSource = '0', pCode = '0') {
        super(pMessage, 416, pSource, pCode);
    }
}

class ExpectationFailedError extends BasicMessageError {
    /**
     * Expectativa indicada pelo campo Expect do cabeçalho da requisição não pode ser satisfeita pelo servidor.
     * @param {string} [pMessage='Expectation Failed']
     */
    constructor(pMessage = 'Expectation Failed', pSource = '0', pCode = '0') {
        super(pMessage, 417, pSource, pCode);
    }
}

class ImATeapotError extends BasicMessageError {
    /**
     * O servidor recusa a tentativa de coar café num bule de chá.
     * @param {string} [pMessage="I'm a teapot"]
     */
    constructor(pMessage = "I'm a teapot", pSource = '0', pCode = '0') {
        super(pMessage, 418, pSource, pCode);
    }
}

class MisdirectedRequestError extends BasicMessageError {
    /**
     * A requisição foi direcionada a um servidor inapto a produzir a resposta.
     * Pode ser enviado por um servidor que não está configurado para produzir respostas para a combinação de esquema ("scheme") e autoridade inclusas na URI da requisição
     * @param {string} [pMessage='Misdirected Request']
     */
    constructor(pMessage = 'Misdirected Request', pSource = '0', pCode = '0') {
        super(pMessage, 421, pSource, pCode);
    }
}

class UnprocessableEntityError extends BasicMessageError {
    /**
     * A requisição está bem formada, mas inabilitada para ser seguida devido a erros semânticos.
     * @param {string} [pMessage='Unprocessable Entity']
     */
    constructor(pMessage = 'Unprocessable Entity', pSource = '0', pCode = '0') {
        super(pMessage, 422, pSource, pCode);
    }
}

class LockedError extends BasicMessageError {
    /**
     * O recurso solicitado está trancado
     * @param {string} [pMessage='Locked']
     */
    constructor(pMessage = 'Locked', pSource = '0', pCode = '0') {
        super(pMessage, 423, pSource, pCode);
    }
}

class FailedDependencyError extends BasicMessageError {
    /**
     * A requisição falhou devido a falha em requisição prévia.
     * @param {string} [pMessage='Failed Dependency']
     */
    constructor(pMessage = 'Failed Dependency', pSource = '0', pCode = '0') {
        super(pMessage, 424, pSource, pCode);
    }
}

class UpgradeRequiredError extends BasicMessageError {
    /**
     * O servidor se recusa a executar a requisição usando o protocolo enviado,
     * mas estará pronto a fazê-lo após o cliente atualizar para um protocolo diferente.
     * O servidor envia um cabeçalho Upgrade numa resposta 426 para indicar o(s) protocolo(s) requeridos.
     * @param {string} [pMessage='Upgrade Required']
     */
    constructor(pMessage = 'Upgrade Required', pSource = '0', pCode = '0') {
        super(pMessage, 426, pSource, pCode);
    }
}

class PreconditionRequiredError extends BasicMessageError {
    /**
     * O servidor de origem requer que a resposta seja condicional.
     * Feito para prevenir o problema da 'atualização perdida', onde um cliente pega o estado de um recurso (GET),
     * modifica-o, e o põe de volta no servidor (PUT), enquanto um terceiro modificou o estado no servidor, levando a um conflito.
     * @param {string} [pMessage='Precondition Required']
     */
    constructor(pMessage = 'Precondition Required', pSource = '0', pCode = '0') {
        super(pMessage, 428, pSource, pCode);
    }
}

class TooManyRequestsError extends BasicMessageError {
    /**
     * O usuário enviou muitas requisições num dado tempo.
     * @param {string} [pMessage='Too Many Requests']
     */
    constructor(pMessage = 'Too Many Requests', pSource = '0', pCode = '0') {
        super(pMessage, 429, pSource, pCode);
    }
}

class RequestHeaderFieldsTooLargeError extends BasicMessageError {
    /**
     * Os campos de cabeçalho estão muito grandes.
     * @param {string} [pMessage='Request Header Fields Too Large']
     */
    constructor(pMessage = 'Request Header Fields Too Large', pSource = '0', pCode = '0') {
        super(pMessage, 431, pSource, pCode);
    }
}

class UnavailableForLegalReasonsError extends BasicMessageError {
    /**
     * O usuário requisitou um recurso indisponível por questões legais.
     * @param {string} [pMessage='Unavailable For Legal Reasons']
     */
    constructor(pMessage = 'Unavailable For Legal Reasons', pSource = '0', pCode = '0') {
        super(pMessage, 451, pSource, pCode);
    }
}

class RequestCanceled extends BasicMessageError {
    /**
     * O request foi cancelado pelo usuário.
     * @param {string} [pMessage='Request Canceled']
     */
    constructor(pMessage = 'Request Canceled', pSource = '0', pCode = '1') {
        super(pMessage, 404, pSource, pCode);
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
