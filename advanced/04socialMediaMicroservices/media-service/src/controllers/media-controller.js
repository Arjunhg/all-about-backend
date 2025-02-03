const Media = require('../models/media');
const logger = require('../utils/logger');
const {uploadMediaToCloudinary} = require('../utils/cloudinary');

const uploadMedia = async(req, res) => {

    logger.info(`Uploading media for user: ${req.user.userId}`);
    logger.info('Starting media upload')

    try {
        
        if(!req.file){
            logger.error('No file found in request');
            return res.status(400).json({
                success: false,
                message: 'No file found in request'
            });
        }

        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info('Uploading file to cloudinary starting...');

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`File uploaded to cloudinary successfully. Public Id: -${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            orignalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save();

        res.status(200).json({
            success: true,
            message: 'Media uploaded successfully',
            mediaId: newlyCreatedMedia._id, //will be used in post-service
            url: newlyCreatedMedia.url
        })

        /*
        newlyCreatedMedia: 
        {
            "success": true,
            "message": "Media uploaded successfully",
            "mediaId": {
                "publicId": "ov6lfdiisw46hnoqcgmm",
                "orignalName": "b2.jpg",
                "mimeType": "image/jpeg",
                "url": "https://res.cloudinary.com/drrtjxhb2/image/upload/v1738588760/ov6lfdiisw46hnoqcgmm.jpg",
                "userId": "679fb27e206c65e1ec3ec606",
                "_id": "67a0c259cf7304a253c131a2",
                "createdAt": "2025-02-03T13:19:21.580Z",
                "updatedAt": "2025-02-03T13:19:21.580Z",
                "__v": 0
            },
            "url": "https://res.cloudinary.com/drrtjxhb2/image/upload/v1738588760/ov6lfdiisw46hnoqcgmm.jpg"
        }

        This mediaId will be used in post-service to store the mediaId in post
        mediaIds: [
            {
                type: String, //will be coming from media service
            }
        ],

        .Now lets say we want to delete the post which containes this mediaID. Then it should be deleted from both post service and media service. SO delete from post service, media service and cloudinary. So we need to communicate between two services without any disturbance. This is where we implement RabbitMQ. Decoupling the services.
        */
    } catch (error) {
        logger.error(`Error uploading media: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {uploadMedia};