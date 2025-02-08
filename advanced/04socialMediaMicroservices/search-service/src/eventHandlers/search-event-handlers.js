const Search = require("../models/Search");
const logger = require("../utils/logger");

async function handlePostCreated(event){

    try {
        
        const newSearchPost = new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt
        }) //from advanced\04socialMediaMicroservices\search-service\src\server.js at createPost. // event publish for search-service

        await newSearchPost.save();

        logger.info("Post created successfully in search-service:", event.postId, newSearchPost._id.toString());
    } catch (error) {
        logger.error("Error in handlePostCreated event in search-service", error);
    }
}

async function handlePostDeleted(event){
    try {
        await Search.findOneAndDelete({postId: event.postId});
        logger.info("Post deleted successfully in search-service:", event.postId);
    } catch (error) {
        logger.error("Error in handlePostDeleted event in search-service", error);
    }
}

module.exports = { handlePostCreated, handlePostDeleted };