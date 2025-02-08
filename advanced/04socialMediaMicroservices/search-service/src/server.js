require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const searchRoutes = require('./routes/search-routes');
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/search-event-handlers');

const app = express();
const PORT = process.env.PORT || 3004;

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

const searchRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Searching Rate limit exceeded for IP ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use('/api/search', searchRateLimit);
app.use('/api/search', searchRoutes);

app.use(errorHandler);

async function startServer(){
    try {
        await connectRabbitMQ();

        // consume/subscribe to events
        await consumeEvent('post.created', handlePostCreated);
        await consumeEvent('post.deleted', handlePostDeleted); //from advanced\04socialMediaMicroservices\post-service\src\controllers\post-controller.js deletePost

        app.listen(PORT, () => {
            logger.info(`Search service started on port ${PORT}`);
        })

    } catch (error) {
        logger.error("Error starting search server", error);
        process.exit(1);
    }
}
startServer();