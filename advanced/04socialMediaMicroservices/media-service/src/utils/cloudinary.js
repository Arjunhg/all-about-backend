const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// cloudinary.config({
//     cloud_name: "drrtjxhb2",
//     api_key: "335924532418662",
//     api_secret: "8y-a3boNuryi76bHGufy-tSr_28"
// })

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.apiKey,
    api_secret: process.env.api_secret
})

const uploadMediaToCloudinary = (file) => {

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
            },
            (error, result) => {
                if(error){
                    logger.error(`Error uploading file to cloudinary: ${error.message}`);
                    reject(error);
                }
                resolve(result);
            }
        )
        uploadStream.end(file.buffer);
    })
}

module.exports = {uploadMediaToCloudinary};