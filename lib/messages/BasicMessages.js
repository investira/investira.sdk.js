class BasicMessage extends Error {
    /**
     * Creates an instance of MessageError.
     * @param {object} pMessage
     * @param {object} pProps code:{status: código http, source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage, pProps) {
        let xMessageText = '';
        let xBasicError = null;
        if (pMessage) {
            xBasicError = pMessage.error || pMessage.message || null;
            if (xBasicError && xBasicError.code) {
                xMessageText = xBasicError.description || '';
                pProps = { ...pProps, code: { ...xBasicError.code } };
            } else {
                xMessageText = pMessage;
            }
            super(xMessageText.trim());
        } else {
            super();
        }

        this.name = this.constructor.name;
        this.isBasicMessage = true;
        this.description = xMessageText.trim();
        if (pProps) {
            if (pProps.showStack) {
                this.showStack = true;
            }
            if (pProps.code && pProps.code.status) {
                this.status = pProps.code.status;
                this.code = {
                    status: pProps.code.status,
                    source: String(pProps.code.source || '0'),
                    ref: String(pProps.code.ref || '0')
                };
            }
            if (pProps.detail) {
                this.detail = pProps.detail;
            }
        }
        if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(pMessage).stack;
        }
        // } else {
        //     super();
        //     if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
        //         Error.captureStackTrace(this, this.constructor);
        //     }
        // }
    }
}
class BasicMessageSuccess extends BasicMessage {
    /**
     * Creates an instance of MessageError.
     * @param {string} pMessage Texto da Mensagem
     * @param {object} pProps code:{status: código http, source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage, pProps = {}) {
        super(pMessage, pProps || {});
        this.isBasicMessageSuccess = true;
    }
}

class BasicMessageError extends BasicMessage {
    /**
     * Creates an instance of MessageError.
     * @param {string} pMessage Texto da Mensagem
     * @param {object} pProps code:{status: código http, source:Código da origem do erro, ref:Código do erro}, showStack
     */
    constructor(pMessage, pProps = {}) {
        super(pMessage, pProps || {});
        this.isBasicMessageError = true;
    }
}

module.exports = { BasicMessage, BasicMessageError, BasicMessageSuccess };
