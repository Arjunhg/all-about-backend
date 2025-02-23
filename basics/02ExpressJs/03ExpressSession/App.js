import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { config } from './config/config';
import { sessionMiddleware } from './middleware/session';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';

const app = express();

app.use(helmet());

const rateLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
})
app.use(rateLimiter);

app.use(express.json());
app.use(compression())
app.use(cookieParser(config.cookieSecret))
app.use(sessionMiddleware) //every request will now have req.session

app.use('/auth', authRouter);

app.use('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timeStamp: new Date().toISOString()
    })
})

app.use(errorHandler);

const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.environment} mode`);
});

const shutdown = () => {
    console.log('Shutting down server');
    server.close(() => {
        console.log('Server has been shut down');
    })

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000)
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;