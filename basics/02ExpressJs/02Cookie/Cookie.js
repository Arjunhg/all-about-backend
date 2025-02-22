import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8080;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'your-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan(NODE_ENV==='production' ? 'combined' : 'dev'));
app.use(cookieParser(COOKIE_SECRET));

const COOKIE_CONFIG = {
    httpOnly: true,
    secure: NODE_ENV==='production',
    // sameSite: 'strict', //CSRF protection
    sameSite: 'none', //allow cross origin
    maxAge: 24*60*60*1000,
    signed: true,
    path: '/' //	Cookie is available to all routes 
}

const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        status: 'error',
        message: NODE_ENV==='production' ? 'Something went wrong' : err.message
    })
}

app.get('/', (req, res, next) => {
    try {
        res.cookie('userId', '99', COOKIE_CONFIG);
        res.status(200).json({
            status: 'success',
            message: 'Cookie set successfully'
        })
    } catch (error) {
        next(error);
    }
})

app.get('/product', (req, res, next) => {
    try {
        if(NODE_ENV!=='production'){
            console.log('Regular cookie:', req.cookies);  
            console.log('Signed cookie:', req.signedCookies);  
        }

        if(!req.signedCookies.userId){
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            })
        }

        res.status(200).json({
            status: 'success',
            data:{
                id: 1,
                name: 'Item-1',
                price: 100
            }
        })
    } catch (error) {
        next(error);
    }
})

app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
});

const shutdown = () => {
    console.log("Shutting down the server...");
    server.close(() => {
        console.log("Server has been shutdown successfully");
        process.exit(0);
    })

    setTimeout(() => {
        console.log("Could not close connection in time, forcefully shutting down...");
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


