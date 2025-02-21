import express from "express";
import helmet from "helmet"; // Security middleware
import cors from "cors"; // CORS middleware
import rateLimit from "express-rate-limit"; // Rate limiting
import morgan from "morgan"; // HTTP request logger
import { v4 as uuidv4 } from "uuid"; // For request IDs and better user IDs
import dotenv from "dotenv"; // Environment variable management
import data from "./data/Data.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// === SECURITY AND MIDDLEWARE SETUP ===

// Apply security headers
/** 
 * @see https://helmetjs.github.io/docs/
 * Without Helmet:
    HTTP/1.1 200 OK
    X-Powered-By: Express
 * With Helmet:
    HTTP/1.1 200 OK
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Strict-Transport-Security: max-age=15552000; includeSubDomains
    Referrer-Policy: no-referrer
    Permissions-Policy: camera=(), microphone=(), geolocation=()

*/
app.use(helmet());//https://helmetjs.github.io/


// Configure CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set up rate limiting - prevent abuse/DOS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request parsing middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: false }));

// Logging middleware - use 'dev' for development, 'combined' for production
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));
/*
    * Production log format:
        - 192.168.1.1 - - [21/Feb/2025:10:15:32 +0000] "GET /api/users HTTP/1.1" 200 245 "-" "Mozilla/5.0"
    * Development log format:
        - GET /api/users 200 5.123 ms - 245
*/


// Add request ID for tracking
app.use((req, res, next) => {
    req.id = uuidv4(); // Generate a unique request ID
    res.setHeader('X-Request-ID', req.id); // Attach it to response headers
    next(); // Pass control to the next middleware
});
  

// Environment-specific settings
const PORT = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === 'production';

// === ROUTES ===

/**
 * Health check endpoint for monitoring and load balancers
    - Load balancers (e.g., AWS ALB, Nginx, Kubernetes) periodically call /health to check if the server is running.
    - Monitoring services (e.g., Prometheus, Datadog, New Relic) can ping this endpoint to detect downtime.
 * @route GET /health
 * @returns {Object} 200 - Health status with uptime
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()//YYYY-MM-DDTHH:mm:ss.sssZ
  });
});

/**
 * Basic route for testing the server
 * @route GET /
 * @returns {string} 200 - Welcome message
 */
app.get('/', (req, res) => {
  res.status(200).send("API Server Running");
});

/**
 * Retrieve all users or filter by name via query parameter
 * @route GET /api/v1/users
 * @param {string} name.query - Optional name filter
 * @returns {Array<Object>} 200 - Array of user objects
 * @returns {Object} 404 - Error message when no users match filter
 */
app.get('/api/v1/users', (req, res) => {
  try {
    const { name } = req.query;
    
    if (name) {
      // Case-insensitive name search for better UX
      const users = data.filter(user => 
        user.name.toLowerCase() === name.toLowerCase()
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found matching the provided name"
        });
      }
      
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    }
    
    // Pagination support- GET /api/v1/users?page=1&limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;// Where to start in the dataset.
    const endIndex = page * limit;
    const total = data.length;
    
    // Create pagination object
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    // Return paginated results
    return res.status(200).json({
      success: true,
      count: data.length,
      pagination,
      data: data.slice(startIndex, endIndex)
    });
  } catch (error) {
    console.error(`[ERROR][${req.id}] GET /api/v1/users:`, error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving users"
    });
  }
});

/**
 * Retrieve a single user by ID
 * @route GET /api/v1/users/:id
 * @param {number} id.path.required - User ID
 * @returns {Object} 200 - User object
 * @returns {Object} 400 - Error message when ID is invalid
 * @returns {Object} 404 - Error message when user not found
 */
app.get('/api/v1/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    // Validate that ID is a valid number
    if (isNaN(parsedId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format. User ID must be a number." 
      });
    }
    
    // Find user by ID
    const user = data.find(user => user.id === parsedId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found with the provided ID" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(`[ERROR][${req.id}] GET /api/v1/users/${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving user"
    });
  }
});

/**
 * Create a new user
 * @route POST /api/v1/users
 * @param {Object} requestBody.body.required - User information
 * @param {string} requestBody.body.name.required - User's name
 * @param {string} requestBody.body.displayName.required - User's display name
 * @returns {Object} 201 - Created user with success message
 * @returns {Object} 400 - Error message when required fields are missing
 */
app.post('/api/v1/users', (req, res) => {
  try {
    const { name, displayName } = req.body;
    
    // Enhanced validation
    const validationErrors = [];
    if (!name) validationErrors.push("Name is required");
    if (!displayName) validationErrors.push("Display name is required");
    if (name && typeof name !== 'string') validationErrors.push("Name must be a string");
    if (displayName && typeof displayName !== 'string') validationErrors.push("Display name must be a string");
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Check for duplicates (optional depending on business rules)
    const existingUser = data.find(user => 
      user.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this name already exists"
      });
    }
    
    // Use UUID for production, but keep sequential IDs for simplicity here
    // In production, you'd likely use: id: uuidv4(),
    const newUser = {
      id: Math.max(...data.map(user => user.id), 0) + 1, // Better ID generation
      name: name.trim(),
      displayName: displayName.trim(),
      createdAt: new Date().toISOString()
    };
    
    data.push(newUser);
    
    // 201 Created is appropriate for resource creation
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser
    });
  } catch (error) {
    console.error(`[ERROR][${req.id}] POST /api/v1/users:`, error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating user"
    });
  }
});

/**
 * Update an existing user
 * @route PUT /api/v1/users/:id
 * @param {number} id.path.required - User ID
 * @param {Object} requestBody.body - Fields to update
 * @param {string} requestBody.body.name - User's updated name
 * @param {string} requestBody.body.displayName - User's updated display name
 * @returns {Object} 200 - Updated user with success message
 * @returns {Object} 400 - Error message when ID or fields are invalid
 * @returns {Object} 404 - Error message when user not found
 */
app.put('/api/v1/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    // Validate that ID is a valid number
    if (isNaN(parsedId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format. User ID must be a number."
      });
    }
    
    // Find user index
    const userIndex = data.findIndex(user => user.id === parsedId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided ID"
      });
    }
    
    // Validate update fields
    const { name, displayName } = req.body;
    const validationErrors = [];
    
    if (name !== undefined && typeof name !== 'string') {
      validationErrors.push("Name must be a string");
    }
    
    if (displayName !== undefined && typeof displayName !== 'string') {
      validationErrors.push("Display name must be a string");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Only update provided fields (partial update)
    const updatedUser = { ...data[userIndex] };
    
    if (name !== undefined) updatedUser.name = name.trim();
    if (displayName !== undefined) updatedUser.displayName = displayName.trim();
    updatedUser.updatedAt = new Date().toISOString();
    
    // Update user
    data[userIndex] = updatedUser;
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error(`[ERROR][${req.id}] PUT /api/v1/users/${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating user"
    });
  }
});

/**
 * Delete a user by ID
 * @route DELETE /api/v1/users/:id
 * @param {number} id.path.required - User ID to delete
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Error message when ID is invalid
 * @returns {Object} 404 - Error message when user not found
 */
app.delete('/api/v1/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    // Validate that ID is a valid number
    if (isNaN(parsedId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format. User ID must be a number."
      });
    }
    
    // Find user index
    const userIndex = data.findIndex(user => user.id === parsedId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided ID"
      });
    }
    
    // Remove user
    data.splice(userIndex, 1);
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error(`[ERROR][${req.id}] DELETE /api/v1/users/${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting user"
    });
  }
});

// === ERROR HANDLING ===

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = isProduction 
    ? 'Internal server error'
    : err.message || 'Something went wrong';
  
  console.error(`[ERROR][${req.id}] Unhandled exception:`, err.stack);
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// === SERVER STARTUP ===

// Process error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Log to monitoring service in production
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Log to monitoring service in production
});

// Start the server with graceful shutdown support
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', shutdown);//docker stop my-container. Docker sends SIGTERM before forcefully killing the process.
process.on('SIGINT', shutdown);//CTRL+C in terminal

export default app; // Enable testing by exporting the app