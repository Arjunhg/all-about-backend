// First create model for refresh token: RefreshToken.js

const RefreshToken = require('../models/RefreshToken');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');
const { validateRegistration, validateLogin } = require('../utils/validation');

// user-registration
const registerUser = async(req, res) => {

    logger.info('Registration endpoint hit...');

    try {
        
        // validate the schema
        const { error } = validateRegistration(req.body)

        if(error){
            logger.warn('Validation Error', error.details[0].message);
            return res.status(400).json(
                { 
                    success: false,
                    message: error.details[0].message 
                }
            );
        }

        const { email, password, username } = req.body;

        let user = await User.findOne({ $or : [ {email}, {username} ] });
        if(user){
            logger.warn('User Already Exists');
            return res.status(400).json(
                { 
                    success: false,
                    message: 'User Already Exist'
                }
            );
        }

        user = new User({
            email,
            password,
            username
        });
        await user.save();

        logger.warn('User Saved Successfully', user._id);
        
        // Now first create generateToken.js in utils folder
        const { accessToken, refreshToken } = await generateToken(user);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            accessToken,
            refreshToken
        })

        // now create identity-service.js in routes and update it as router.post('/register', registerUser);

    } catch (error) {
        
        logger.error('Registration Error Occured', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

// user-login
const loginUser = async(req, res) => {

    logger.info('Login endpoint hit...');

    try {
        
        const { error } = validateLogin(req.body);
        if(error){
            logger.warn("Validation Error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password } = req.body;
        const user = await User.findOne({email});

        if(!user){
            logger.warn("Invalid User");
            return res.status(400).json(
                {
                    success: false,
                    message: "Invalid Credentials"
                }
            )
        }

        // valid paassword or not
        const isValidPassword = await user.comparePassword(password);
        if(!isValidPassword){
            logger.warn("Invalid password");
            return res.status(400).json({
              success: false,
              message: "Invalid password",
            });
        }

        const { accessToken, refreshToken } = await generateToken(user);

        res.json({
            accessToken,
            refreshToken,
            userId: user._id
        });
    } catch (error) {
        logger.error("Login error occured", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
    }
}


// refresh-token
const refreshTokenUser = async(req, res) => {

    logger.info('Refresh Token endpoint hit...');

    try {
        
        const { refreshToken } = req.body;

        if(!refreshToken){
            logger.warn("Refresh token not found");
            return res.status(400).json({
                success: false,
                message: "Refresh token not found",
            })
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn("Refresh token is invalid or expired");

            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid or expired",
            })
        }

        const user = await User.findById(storedToken.user);

        if(!user){
            logger.warn("User not found");
            return res.status(401).json({
                success: false,
                message: "User not found",
            })
        }

        // create token
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

        // delete old refresh token
        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    } catch (error) {
        logger.error("Refresh token error occured", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
    }
}

// logout
const logoutUser = async(req, res) => {
    
    logger.info('Logout endpoint hit...');

    try {
        
        const { refreshToken } = req.body;
        if(!refreshToken){
            logger.warn('Refresh token not found');
            res.status(400).json({
                success: false,
                message: 'Refresh token not found'
            })
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info("Refresh token deleted successfully for logout");

        res.json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        logger.error("Error while logging out", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
    }
}
module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };