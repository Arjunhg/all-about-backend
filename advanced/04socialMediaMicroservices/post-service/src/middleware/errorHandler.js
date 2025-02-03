const logger = require('../utils/logger');

// same as other services

const errorHandler = (err, req, res, next) => {

    logger.error(err.stack);

    res.status(err.status || 500).json(
        {
            message: err.message || 'Internal Server Error'
        }
    )
}
module.exports = errorHandler;