//will consume postId and userId and mediaIds from post-service and delete the media from media-service.

const Media = require("../models/media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");

const handlePostDeleted = async(event) => {
    console.log("eventeventevent", event);

    const { postId, mediaIds } = event;

    try {
        
        // which media we need to delete
        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

        for(const media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId); //delete from cloudinary
            await Media.findByIdAndDelete(media._id); //delete from db

            logger.info(`Media with id ${media._id} deleted successfully associated with post ${postId}`);
        }
        logger.info(`Processed deletion of media for post id ${postId}`);
    } catch (error) {
        logger.error("Error while deleting media", error);
    }
}

module.exports = { handlePostDeleted };