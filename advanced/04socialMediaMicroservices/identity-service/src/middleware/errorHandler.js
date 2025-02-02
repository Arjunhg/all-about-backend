const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

    logger.error(err.stack);

    res.status(err.status || 500).json(
        {
            message: err.message || 'Internal Server Error'
        }
    )
}
module.exports = errorHandler;

//1️⃣ If an error occurs in any route or middleware, Express will automatically call this function.