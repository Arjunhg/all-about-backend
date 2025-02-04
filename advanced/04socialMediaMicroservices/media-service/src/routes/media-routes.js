const express = require('express');
const multer = require('multer');

const { uploadMedia, getAllMedia } = require('../controllers/media-controller');
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

router.get('/get', authenticateRequest, getAllMedia);

module.exports = router;


/* Frontend code for uploadMedia function

import React, { useState } from 'react';
import axios from 'axios'; // Recommended for making HTTP requests

const MediaUploadComponent = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null);

    // Handler for file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        
        // Optional: Add file validation
        if (file) {
            // Validate file size (matching your 5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Max 5MB allowed.');
                return;
            }
            
            // Optional: Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Only JPEG, PNG, GIF allowed.');
                return;
            }

            setSelectedFile(file);
        }
    };

    // File upload handler
    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }

        // Create FormData - crucial for file uploads
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Include authentication token if needed
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                // Optional: Track upload progress
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            // Handle successful upload
            if (response.data.success) {
                setUploadStatus('Upload successful!');
                // You might want to update UI or parent component
                // with new mediaId or url
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('Upload failed. Please try again.');
        }
    };

    return (
        <div>
            <input 
                type="file" 
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/gif"
            />
            <button 
                onClick={handleFileUpload}
                disabled={!selectedFile}
            >
                Upload Media
            </button>

            {uploadProgress > 0 && (
                <div>Upload Progress: {uploadProgress}%</div>
            )}

            {uploadStatus && (
                <div>{uploadStatus}</div>
            )}
        </div>
    );
};

export default MediaUploadComponent;

*/