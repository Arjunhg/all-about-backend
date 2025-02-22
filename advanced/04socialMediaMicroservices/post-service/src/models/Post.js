const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaIds: [
        {
            type: String, //will be coming from media service
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

// since we will have different service for search we can skip this index 
// postSchema.index({ content: "text"});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;