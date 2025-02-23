import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    cookieSecret: process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex'),
    environment: process.env.NODE_ENV || 'development',
    sessionOptions: {
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        maxAge: 24*60*60*1000,
        sameSite: 'strict'  // Prevents CSRF attacks
    }
}