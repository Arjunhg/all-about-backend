require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const errorHandler = require('./middleware/errorHandler');
const validateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1: connect to redis
const redisClient = new Redis(process.env.REDIS_URL);

// 2: middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

//3: rate limiter middleware
const RateLimit = rateLimit({
    windowMs: 15*60*1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive Endpoint Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json(
            {
                success: false,
                message: 'Too Many Requests'
            }
        );
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
})
app.use(RateLimit);

// 4: middleware
app.use((req,res,next) => {
    logger.info(`Received ${req.method} request to ${req.url}`); //logging request
    logger.info(`Request Body ${req.body}`); 
    next();
})

//5: creating proxy
//5: creating proxy
// api-gateway -> /v1/auth/register       -> 3000
//                                            | 
// identity-service -> /api/auth/register -> 3001
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, '/api'); //replace /v1 prefix with /api
    },
    proxyErrorHandler : (err, res, next) => {
        logger.error(`Proxy Error: ${err.message}`);
        res.status(500).json({
            message: `Internal Server Error`,
            error: err.message
        })
    }
}

// 6: setting up proxy for our identity-service
app.use('/v1/auth', proxy( process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => { // allow customization of proxy request before it is sent to identity-service
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => { // this function will be called whenever receiving a response from proxy service
        logger.info(`Response Received from Identity Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))

//after creating createPost in post-service post-controller and authMiddleware in api-gateway middleware folder
app.use('/v1/post', validateToken, proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response Received from Post Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))

// setting up proxy for our media-service
app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

        // since media is form data:
        if(!srcReq.headers['content-type'].startsWith('multipart/form-data')){
            proxyReqOpts.headers['Content-Type'] = 'application/json';
        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response Received from Media Service: ${proxyRes.statusCode}`);
        return proxyResData;
    },
    parseReqBody: false //will ensure entire request body is proxied for file upload also
}))

app.use('/v1/search', validateToken, proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response Received from Search Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))


// 7: error handler
app.use(errorHandler);

// 8: start server
app.listen(PORT, () => {
    logger.info(`API Gateway is listening on port ${PORT}`);
    logger.info(`Identity Service is running on port ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service is running on port ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service is running on port ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Search Service is running on port ${process.env.SEARCH_SERVICE_URL}`);
    logger.info(`Redis Url is ${process.env.REDIS_URL}`);
})