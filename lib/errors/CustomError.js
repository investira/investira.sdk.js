class CustomError extends Error {
    constructor(pMessage, pStatus) {
        super(pMessage);
        this.name = this.constructor.name;
        this.status = pStatus;
        this.text = pMessage;
        this.statusMessage = pMessage;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(pMessage).stack;
        }
    }
}

module.exports = CustomError;
