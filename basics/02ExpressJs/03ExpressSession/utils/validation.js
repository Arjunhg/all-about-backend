import { body, validationResult } from 'express-validator';

/*
🔹 Each function in the array is an independent middleware.
🔹 Express executes middleware sequentially, so each step runs in order.
🔹 express-validator is middleware-based validator. Built in but not very scalable
🔹 For production and big project use schema-based validator like zod and joi
*/
export const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().notEmpty(),
    body('age').isInt({min: 0}),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            })
        }
        next();
    }
]

/*
export const validateLogin = (req, res, next) => {
    Promise.all([
        body('email').isEmail().normalizeEmail().run(req),
        body('name').trim().notEmpty().run(req),
        body('age').isInt({ min: 0 }).run(req),
    ]).then(() => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    });
};

*/