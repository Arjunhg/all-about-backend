import session from 'express-session';
import {config} from '../config/config.js';

export const sessionMiddleware = session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
    name: 'sessionId',
    cookie: {
        ...config.sessionOptions,
        secure: config.environment === 'production'
    }
})