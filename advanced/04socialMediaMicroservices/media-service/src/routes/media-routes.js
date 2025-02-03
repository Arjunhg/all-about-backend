const express = require('express');
const multer = require('multer');

const { uploadMedia } = require('../controllers/media-controller');
const { authenticateRequest } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// configure multer for file upload or can create seperate file
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).single('file');

router.post('/upload', authenticateRequest, (req,res,next) => {
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            logger.error('Multer Error while uploading file: ', err.message);
            return res.status(400).json({
                success: false,
                message: 'Multer Error while uploading file',
                error: err.message,
                stack: err.stack
            })
        } else if(err){
            logger.error('Unknown Error while uploading file: ', err.message);
            return res.status(500).json({
                success: false,
                message: 'Unknown Error while uploading file:',
                error: err.message,
                stack: err.stack
            })
        }

        if(!req.file){
            logger.error('No file found in request');
            return res.status(400).json({
                success: false,
                message: 'No file found in request'
            });
        }

        next();
    })
}, uploadMedia);

module.exports = router;