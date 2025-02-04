require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mediaRoutes = require('./routes/media-routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const { handlePostDeleted } = require('./eventHandlers/media-event-handlers');

const app = express();
const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGODB_URI).then(() => logger.info('Connected to MongoDB')).catch((err) => logger.error('MongoDB connection error:',err.message));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
})

// rate limiter
const uploadMediaRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Upload media Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})
app.use('/api/media/upload', uploadMediaRateLimit);

app.use('/api/media', mediaRoutes);

app.use(errorHandler);

async function startServer(){
    try {
        await connectRabbitMQ(); 

        // consume all the events here
        await consumeEvent('post.deleted', handlePostDeleted) //post.deleted is the routing key
        app.listen(PORT, () => {
            logger.info(`Media Service is listening on port ${PORT}`);
        })
    } catch (error) {
        logger.error("Error starting server", error);
        process.exit(1);
    }
}

startServer();

process.on("unhandledRejection", (reason, promise)  => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
})
