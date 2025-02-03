const mongoose = require('mongoose');

const mediaScheme = new mongoose.Schema({
    publicId: { //from claudeinary
        type: String,
        required: true
    },
    orignalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    url:{
        type: String,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {  timestamps: true });

const Media = mongoose.model('Media', mediaScheme);

module.exports = Media;