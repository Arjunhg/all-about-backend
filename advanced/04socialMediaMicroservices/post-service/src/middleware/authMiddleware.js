const logger = require('../utils/logger');

const authenticateRequest = (req, res, next) => {

    // way to get userId
    const userId = req.headers['x-user-id']; //x-user-id will be from api gateway

    if(!userId){
        logger.warn(`Access attempted without userId`);
        res.status(401).json({
            success: false,
            message: "Authentication required! Please login to continue"
        })
    }

    req.user = { userId };
    next();
}

module.exports = {authenticateRequest};