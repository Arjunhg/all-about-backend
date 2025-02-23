import { config } from "../config/config";

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: config.environment === 'production' ? 'Internal Server Error' : err.message
    })
}