const CustomError = require('./CustomError');

// class CustomError extends Error {
//     /** kkfrkrmfkrmf
//      *Creates an instance of CustomError.
//      * @param {*} pMessage
//      * @param {*} pStatus
//      * @memberof CustomError
//      */
//     constructor(pMessage, pStatus) {
//         super(pMessage);
//         this.name = this.constructor.name;
//         this.status = pStatus;
//         this.text = pMessage;
//         this.statusMessage = pMessage;
//         if (typeof Error.captureStackTrace === 'function') {
//             Error.captureStackTrace(this, this.constructor);
//         } else {
//             this.stack = new Error(pMessage).stack;
//         }
//     }
// }
// module.exports = CustomError;

// class BadRequestError extends CustomError {
//     constructor(pMessageText = 'Bad Request') {
//         super(pMessageText, 400);
//     }
// }
// module.exports = BadRequestError;

// class TokenExpiredError extends CustomError {
//     constructor(pMessageText = 'Token expired') {
//         super(pMessageText, 401);
//     }
// }
// module.exports = TokenExpiredError;

// class UnauthorizedError extends CustomError {
//     constructor(pMessageText = 'Unauthorized') {
//         super(pMessageText, 401);
//     }
// }
// module.exports = UnauthorizedError;

// class PaymentRequiredError extends CustomError {
//     constructor(pMessage = 'Payment Required') {
//         super(pMessage, 402);
//     }
// }
// module.exports = PaymentRequiredError;

class ForbiddenError extends CustomError {
    constructor(pMessage = 'Forbidden') {
        super(pMessage, 403);
    }
}
module.exports = ForbiddenError;

// class NotFoundError extends CustomError {
//     constructor(pMessage = 'Not found') {
//         super(pMessage, 404);
//     }
// }
// module.exports = NotFoundError;

// class MethodNotAllowedError extends CustomError {
//     constructor(pMessage = 'Method Not Allowed') {
//         super(pMessage, 405);
//     }
// }
// module.exports = MethodNotAllowedError;

// class NotAcceptableError extends CustomError {
//     constructor(pMessage = 'Not Acceptable') {
//         super(pMessage, 406);
//     }
// }
// module.exports = NotAcceptableError;
