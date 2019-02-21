const CustomError = require('./CustomError');

class ForbiddenError extends CustomError {
    constructor(pMessage = 'Forbidden') {
        super(pMessage, 403);
    }
}

module.exports = ForbiddenError;
