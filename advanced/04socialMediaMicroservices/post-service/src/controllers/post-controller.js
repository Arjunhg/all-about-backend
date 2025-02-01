const Post = require('../models/Post');
const logger = require('../utils/logger');

const createPost = async (req, res) => {

    logger.info("Create post endpoint hit");

    try {
        
        const { content, mediaIds } = req.body;
        const newlyCreatedPost = new Post({
            user: req.user.userId, //from where?? this is present in identity-service while authentication. So we need to get it. using middleware we will update the headers of request. (we need authentication user). Create post-route.js
            content,
            mediaIds: mediaIds || [],
        })

        await newlyCreatedPost.save();
        logger.info("Post created successfully", newlyCreatedPost);
        res.status(201).json({
            success: true,
            message: "Post created successfully",
        })
    } catch (error) {
        logger.error("Error while creating post", error);
        res.status(500).json({
            success: false,
            message: "Error Creating post"
        })
    }
}

const getAllPosts = async (Req, res) => {

    logger.info("Get all post endpoint hit");

    try {
        
    } catch (error) {
        logger.error("Error while fetching post", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post"
        })
    }
}

const getPost = async (Req, res) => {

    logger.info("get post endpoint hit");

    try {
        
    } catch (error) {
        logger.error("Error while fetching post", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post"
        })
    }
}

const deletePost = async (Req, res) => {

    logger.info("delete post endpoint hit");

    try {
        
    } catch (error) {
        logger.error("Error while deleting post", error);
        res.status(500).json({
            success: false,
            message: "Error deleting post"
        })
    }
}

module.exports = { createPost, getAllPosts, getPost, deletePost };