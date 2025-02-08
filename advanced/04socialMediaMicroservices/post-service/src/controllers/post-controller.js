const Post = require('../models/Post');
const invalidateCache  = require('../utils/invalidateCache');
const logger = require('../utils/logger');
const { validateCreatePost } = require('../utils/validation');
const { publishEvent } = require('../utils/rabbitmq');

const createPost = async (req, res) => {

    logger.info("Create post endpoint hit");

    try {

        const { error } = validateCreatePost(req.body)

        if(error){
            logger.warn('Validation Error', error.details[0].message);
            return res.status(400).json(
                { 
                    success: false,
                    message: error.details[0].message 
                }
            );
        }
        
        const { content, mediaIds } = req.body;
        const newlyCreatedPost = new Post({
            user: req.user.userId, //from where?? this is present in identity-service while authentication. So we need to get it. using middleware we will update the headers of request. (we need authentication user)(normally we have user._id). Create post-route.js
            content,
            mediaIds: mediaIds || [],
        })

        await newlyCreatedPost.save();

        // event publish for search-service
        await publishEvent('post.created', {
            postId: newlyCreatedPost._id.toString(),
            userId: newlyCreatedPost.user.toString(),
            content: newlyCreatedPost.content,
            createdAt: newlyCreatedPost.createdAt
        })

        await invalidateCache(req, newlyCreatedPost._id.toString());

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

const getAllPosts = async (req, res) => {

    logger.info("Get all post endpoint hit");

    try {
        
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPost = await req.redisClient.get(cacheKey); //If any post alraeady present in cache then we will get it from cache.

        if(cachedPost){
            return res.json(JSON.parse(cachedPost));
        }

        const posts = await Post.find({})
            .sort({createdAt: -1}) 
            .skip(startIndex)
            .limit(limit);

        const totalNoOfPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalNoOfPosts / limit),
            totalPosts: totalNoOfPosts
        }

        // save your post in redis cache
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result)); //5 minutes//setex stands for "SET with EXpiration".

        res.json(result);
    } catch (error) {
        logger.error("Error while fetching post", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post"
        })
    }
}

const getPost = async (req, res) => {

    logger.info("get post endpoint hit");

    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;

        const cachedPost = await req.redisClient.get(cacheKey); //If any post alraeady present in cache then we will get it from cache.

        if(cachedPost){
            return res.json(JSON.parse(cachedPost));
        }

        const singlePost = await Post.findById(postId);

        if(!singlePost){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(singlePost)); //since single post it will hardly change so 1 hour

        res.json(singlePost);
    } catch (error) {
        logger.error("Error while fetching post", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post"
        })
    }
}

const deletePost = async (req, res) => {

    logger.info("delete post endpoint hit");

    try {
        const post = await Post.findByIdAndDelete({
            _id: req.params.id,
            user: req.user.userId //getting from authMiddleware
        })

        if(!post){
            res.status(404).json({
                message: "Post not found",
                success: false
            })
        }

        // publish post delete method
        await publishEvent('post.deleted', {
            postId: post._id.toString(),
            userId: req.user.userId,
            mediaIds: post.mediaIds
        })
        // we will consume this event in media-service.

        await invalidateCache(req, req.params.id);
        logger.info("Post deleted successfully", post);

        res.json({
            success: true,
            message: "Post deleted successfully"
        })
    } catch (error) {
        logger.error("Error while deleting post", error);
        res.status(500).json({
            success: false,
            message: "Error deleting post"
        })
    }
}

module.exports = { createPost, getAllPosts, getPost, deletePost };
