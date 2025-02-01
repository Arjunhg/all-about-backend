require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const postRoutes = require('./routes/post-route');
const errorHandler = require('./middleware/errorHandler');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

const app = express();
const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGODB_URI).then(() => logger.info("Connected to MongoDB")).catch((e) => logger.error("MongoDB Connection Failed", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
})

// Ip based rate limit (like for post 10 request, for get 100 request)
const createPostRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Creating post Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})
const getPostRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Getting post Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})
app.use('/api/post/create-post', createPostRateLimit);
app.use('/api/post/get-post', getPostRateLimit);

// routes -> pass redisClient to routes
app.use('/api/post', (req, res, next) => {
    req.redisClient = redisClient; //attaching redis client to request
    next();
}, postRoutes);

/* 
Request to /api/post/create-post:

When a request is made to /api/post/create-post, the following steps occur:
The createPostRateLimit middleware is executed first. This middleware checks if the request exceeds the rate limit.
If the request is within the rate limit, it proceeds to the next middleware.
The middleware that attaches the redisClient to the req object is executed.
Finally, the request is handled by the appropriate route handler in postRoutes.
*/

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Post Service is listening on port ${PORT}`);
})

process.on("unhandledRejection", (reason, promise)  => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
})
