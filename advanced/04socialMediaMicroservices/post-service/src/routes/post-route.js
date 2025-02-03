const express = require('express');
const { createPost, getAllPosts, getPost, deletePost } = require('../controllers/post-controller');
const { authenticateRequest } = require('../middleware/authMiddleware');

const router = express.Router();
// middleware for getting info -> will tell if user is auth user or not
// first create auth-middleware.js

// we need to use authenticateRequest for all the routes we create to get the userId as only authenticated user can CUD post
router.use(authenticateRequest);

router.post('/create-post', createPost);
router.get('/all-posts', getAllPosts);
router.get('/:id', getPost);
router.delete('/:id', deletePost);

module.exports = router;