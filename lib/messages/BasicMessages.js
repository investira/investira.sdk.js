class BasicMessage extends Error {
    /**
     * Creates an instance of MessageError.
     * @param {object} pMessage {description, code{status,source,ref}}
     */
    constructor(pMessage) {
        if (pMessage) {
            if (pMessage.description) {
                super(pMessage.description.trim());
                this.description = pMessage.description.trim();
            } else {
                super();
            }
            this.name = this.constructor.name;
            if (pMessage.code) {
                this.status = pMessage.code.status;
                this.code = {
                    status: pMessage.code.status,
                    source: String(pMessage.code.source || '0'),
                    ref: String(pMessage.code.ref || '0')
                };
            }
            if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(this, this.constructor);
            } else {
                this.stack = new Error(pMessage).stack;
            }
        } else {
            super();
            if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }
}
class BasicMessageSuccess extends BasicMessage {
    /**
     * Creates an instance of MessageError.
     * @param {string} pMessage Texto da Mensagem
     * @param {number} pHttpStatus Código http do erro
     */
    constructor(pMessage, pHttpStatus, pSource = '0', pRef = '0') {
        super({
            description: pMessage,
            code: { status: pHttpStatus, source: pSource, ref: pRef }
        });
    }
}

class BasicMessageError extends BasicMessage {
    /**
     * Creates an instance of MessageError.
     * @param {string} pMessage Texto da Mensagem
     * @param {number} pHttpStatus Código http do erro
     * @param {string} [pSource=0] Código da origem do erro
     * @param {string} [pRef=0] Código do erro
     */
    constructor(pMessage, pHttpStatus, pSource = '0', pRef = '0') {
        super({
            description: pMessage,
            code: { status: pHttpStatus, source: pSource, ref: pRef }
        });
    }
}

module.exports = { BasicMessage, BasicMessageError, BasicMessageSuccess };
