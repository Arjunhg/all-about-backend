import express from 'express';
import { validateLogin } from '../utils/validation';
import { isAuthenticated } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

router.post('/login', validateLogin, (req, res, next) => {
    try {
        const { email, name, age } = req.body;

        req.session.user = {
            id: crypto.randomUUID(),
            email,
            name,
            age,
            loginTime: new Date().toISOString()
        }

        res.status(200).json({
            message: 'Login successful',
            user: req.session.user
        })
    } catch (error) {
        next(error);
    }
})

router.post('/logout', isAuthenticated, (req, res, next) => {
    try {
        const username = req.session.user.name;
        req.session.destroy((err) => {
            if(err) throw err;
            res.clearCookie('sessionId');
            res.status(200).json({
                message: `Goodbye ${username}`
            })
        })
    } catch (error) {
        next(error);
    }
})