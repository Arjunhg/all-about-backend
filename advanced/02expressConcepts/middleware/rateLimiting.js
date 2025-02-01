const rateLimit = require('express-rate-limit');

const createBasicRateLimiter = (maxRequests, time) => {

    return rateLimit({
        max:  maxRequests,//max allowed request in given time window
        windowMs: time, //time window in milliseconds
        message: 'Too many requests from this IP, please try again after an hour',
        standardHeaders: true,
        legacyHeaders: false,
    })
}


module.exports = { createBasicRateLimiter };