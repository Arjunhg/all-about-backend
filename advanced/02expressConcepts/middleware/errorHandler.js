

// custom error class

class APIError extends Error {

    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError'; //set error type to api errorś
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    // console.log("Inside Async handler")
    Promise.resolve(fn(req, res, next)).catch(next); //promise ensures that the async handler is awaited properly
}

// global error handler
const globalErrorHandler = (err, req, res, next) => {
    
    console.error(err.stack); //log error stack

    if(err instanceof APIError){
        return res.status(err.statusCode).json(
            {
                status: 'Error',
                message: err.message
            }
        )
    }

    // exmaple: handle mongoose validation
    else if(err.name === 'validationError'){
        return res.status(400).json(
            {
                status: 'Error',
                message: "Validation Error"
            }
        )
    }else{
        return res.status(500).json(
            {
                status: 'error',
                message: 'Internal Server Error'
            }
        )
    }
    
}

module.exports = { APIError, asyncHandler, globalErrorHandler }