
require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterRedis } = require('rate-limiter-flexible')
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 3001;

// connect to database: 1
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected To MongoDB'))
    .catch(error => logger.error('MongoDB Connection Failed', error));

    // 3
const redisClient = new Redis(process.env.REDIS_URL)

// middleware: 2
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next) => {
    logger.info(`Received ${req.method} request to ${req.url}`); //logging request
    logger.info(`Request Body ${req.body}`); 
    next();
})

// 4: DDoS protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware', //added to redis key for rate limiting. Helps DIstinguish rate limit data with other redis data
    points: 5, // 5 requests per 1 minute
    duration: 60,
})
app.use((req,res,next) => {
    rateLimiter.consume(req.ip).then(() => next()).catch(() => {
        logger.warn(`Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json(
            {
                success: false,
                message: 'Too Many Requests'
            }
        );
    })
})

// IP based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15*60*1000, // 15 minutes in milliseconds// for how many time you want to limit the request
    max: 5, // how many requests you want to allow in a given window
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers (RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset)
    legacyHeaders: false, // disable the `X-RateLimit-*` headers
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

    /*

        +------------------+       +------------------+
        | Instance A       |       | Instance B       |
        | +--------------+ |       | +--------------+ |
        | | In-Memory    | |       | | In-Memory    | |
        | | Rate Limit   | |       | | Rate Limit   | |
        | +--------------+ |       | +--------------+ |
        +------------------+       +------------------+

        Without RedisStore: Each instance has its own rate limit data.

        +------------------+       +------------------+
        | Instance A       |       | Instance B       |
        | +--------------+ |       | +--------------+ |
        | | Redis        | |<----->| | Redis        | |
        | | Rate Limit   | |       | | Rate Limit   | |
        | +--------------+ |       | +--------------+ |
        +------------------+       +------------------+

        With RedisStore: All instances share the same rate limit data in Redis.
    */
})

// apply sensitiveEndpointsLimiter middleware to specific routes
app.use('/api/auth/register', sensitiveEndpointsLimiter);

// Main ROutes
app.use('/api/auth', routes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Identity Service running on port ${PORT}`);
})

// unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, "reason:", reason);
})