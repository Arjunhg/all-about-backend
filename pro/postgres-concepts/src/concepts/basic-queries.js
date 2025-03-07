const db = require('../db/db');

/**
 * Create users table if it doesn't exist
 * @returns {Promise<void>}
 */
async function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users( 
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await db.query(createTableQuery);
        console.log('Users table created successfully');
        
        // Create an index for frequent queries
        await db.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    } catch (error) {
        console.error('Error creating users table', error);
        throw error; // Properly propagate the error
    }
}

/**
 * Insert a new user
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Created user object
 */
async function insertUser(username, email) {
    if (!username || !email) {
        throw new Error('Username and email are required');
    }
    
    const insertUserQuery = `
        INSERT INTO users(username, email)
        VALUES ($1, $2)
        RETURNING *
    `;

    try {
        const res = await db.query(insertUserQuery, [username, email]);
        console.log('User added successfully', res.rows[0]);
        return res.rows[0];
    } catch (error) {
        // Provide better error messages for common errors
        if (error.code === '23505') { // Unique violation
            console.error('Username or email already exists');
        } else {
            console.error('Error adding user', error);
        }
        throw error;
    }
}

/**
 * Fetch all users from the database
 * @param {number} limit - Maximum number of users to return
 * @returns {Promise<Array>} - Array of user objects
 */
async function fetchAllUsers(limit = 100) {
    const getAllUsersQuery = `
        SELECT * FROM users
        ORDER BY created_at DESC
        LIMIT $1
    `;

    try {
        const res = await db.query(getAllUsersQuery, [limit]);
        console.log('Users fetched successfully, count:', res.rows.length);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all users', error);
        throw error;
    }
}

/**
 * Find a user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} - User object or null if not found
 */
async function findUserByUsername(username) {
    const findUserQuery = `
        SELECT * FROM users
        WHERE username = $1
    `;

    try {
        const res = await db.query(findUserQuery, [username]);
        return res.rows[0] || null;
    } catch (error) {
        console.error('Error finding user', error);
        throw error;
    }
}

/**
 * Update a user's email
 * @param {string} username - Username to identify the user
 * @param {string} newEmail - New email address
 * @returns {Promise<Object|null>} - Updated user or null if not found
 */
async function updateUserEmail(username, newEmail) {
    if (!username || !newEmail) {
        throw new Error('Username and new email are required');
    }

    const updateUserQuery = `
        UPDATE users 
        SET 
            email = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE username = $1
        RETURNING *
    `;

    try {
        const res = await db.query(updateUserQuery, [username, newEmail]);
        
        if (res.rows.length > 0) {
            console.log('User email updated successfully', res.rows[0]);
            return res.rows[0];
        } else {
            console.log('User not found with the provided username');
            return null;
        }
    } catch (error) {
        // Provide better error messages for common errors
        if (error.code === '23505') { // Unique violation
            console.error('Email already in use by another user');
        } else {
            console.error('Error updating user email', error);
        }
        throw error;
    }
}

/**
 * Delete a user by username
 * @param {string} username - Username to identify the user to delete
 * @returns {Promise<Object|null>} - Deleted user or null if not found
 */
async function deleteUser(username) {
    if (!username) {
        throw new Error('Username is required');
    }

    const deleteUserQuery = `
        DELETE FROM users
        WHERE username = $1
        RETURNING *
    `;

    try {
        const res = await db.query(deleteUserQuery, [username]);

        if (res.rows.length > 0) {
            console.log('User deleted successfully', res.rows[0]);
            return res.rows[0];
        } else {
            console.log('User not found with the provided username');
            return null;
        }
    } catch (error) {
        console.error('Error deleting user', error);
        throw error;
    }
}

module.exports = {
    createUsersTable,
    insertUser,
    fetchAllUsers,
    findUserByUsername,
    updateUserEmail,
    deleteUser
};