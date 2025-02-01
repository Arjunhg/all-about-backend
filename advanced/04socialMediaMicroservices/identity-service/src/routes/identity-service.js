const express = require('express');
const { registerUser, loginUser, refreshTokenUser, logoutUser } = require('../controllers/identity-controller');
const router = express.Router();


router.post('/register', registerUser); //now move to server.js
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenUser);
router.post('/logout', logoutUser);

module.exports = router;