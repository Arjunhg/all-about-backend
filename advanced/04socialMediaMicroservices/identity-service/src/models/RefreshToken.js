// every time user register or login we will create a refresh token. Let's say we save that token for 7D, and RT is required whenever we logout and we need to delete that RT from our database also

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({

    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {timestamps: true});

refreshTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
)

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;

// now go to identity-controller