const CustomError = require('./CustomError');

class UnauthorizedError extends CustomError {
    constructor(pMessageText = 'Unauthorized') {
        super(pMessageText, 401);
    }
}

module.exports = UnauthorizedError;
