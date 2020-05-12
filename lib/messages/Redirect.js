const { BasicMessageSuccess } = require('./BasicMessages');

class MultipleChoiceMessage extends BasicMessageSuccess {
    /**
     * A requisição tem mais de uma resposta possível. User-agent ou o user deve escolher uma delas.
     * @param {string} [pMessage='Multiple Choice']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Multiple Choice', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 300 } });
    }
}

class MovedPermanentlyMessage extends BasicMessageSuccess {
    /**
     * URI do recurso requerido mudou. Provavelmente, a nova URI será especificada na resposta.
     * @param {string} [pMessage='Moved Permanently']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Moved Permanently', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 301 } });
    }
}

class FoundMessage extends BasicMessageSuccess {
    /**
     * URI do recurso requerido foi mudada temporariamente. Novas mudanças na URI poderão ser feitas no futuro.
     * Portanto, a mesma URI deve ser usada pelo cliente em requisições futuras.
     * @param {string} [pMessage='Found']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Found', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 302 } });
    }
}

class SeeOtherMessage extends BasicMessageSuccess {
    /**
     * Resposta para instruir ao cliente buscar o recurso requisitado em outra URI com uma requisição GET.
     * @param {string} [pMessage='See Other']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'See Other', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 303 } });
    }
}

class NotModifiedMessage extends BasicMessageSuccess {
    /**
     * Essa resposta é usada para questões de cache.
     * Diz ao cliente que a resposta não foi modificada. Portanto, o cliente pode usar a mesma versão em cache da resposta.
     * @param {string} [pMessage='Not Modified']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Not Modified', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 304 } });
    }
}

class TemporaryRedirectMessage extends BasicMessageSuccess {
    /**
     * O servidor mandou essa resposta direcionando o cliente a buscar o recurso requisitado em outra URI com o mesmo método que foi utilizado na requisição original.
     * Tem a mesma semântica do código 302 Found, com a exceção de que o user-agent não deve mudar o método HTTP utilizado.
     * Se um POST foi utilizado na primeira requisição, um POST deve ser utilizado na segunda.
     * @param {string} [pMessage='Temporary Redirect']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Temporary Redirect', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 307 } });
    }
}

class PermanentRedirectMessage extends BasicMessageSuccess {
    /**
     * Esse código significa que o recurso agora está permanentemente localizado em outra URI, especificada pelo cabeçalho de resposta Location.
     * Tem a mesma semântica do código de resposta HTTP 301 Moved Permanently, com a exceção de que o user-agent não deve mudar o método HTTP utilizado.
     * Se um POST foi utilizado na primeira requisição, um POST deve ser utilizado na segunda.
     * @param {string} [pMessage='Permanent Redirect']
     * @param {object} pProps code:{source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage = 'Permanent Redirect', pProps = {}) {
        super(pMessage, { ...pProps, code: { ...pProps.code, status: 308 } });
    }
}

module.exports = {
    MultipleChoiceMessage,
    MovedPermanentlyMessage,
    FoundMessage,
    SeeOtherMessage,
    NotModifiedMessage,
    TemporaryRedirectMessage,
    PermanentRedirectMessage
};
