const CustomError = require('./CustomError');

class TokenExpiredError extends CustomError {
    constructor(pMessageText = 'Token expired') {
        super(pMessageText, 401);
    }
}

module.exports = TokenExpiredError;
