class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; //only operational errors to client in prod no third party package errors

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;