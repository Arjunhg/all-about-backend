const db = require('../db/db');

/**
 * Create posts table with a foreign key relationship to users
 * @returns {Promise<void>}
 */
async function createPostsTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS posts(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    /*
     * Foreign Key Design Notes:
     * - REFERENCES users(id): Creates a foreign key constraint linking posts.user_id to users.id
     * - ON DELETE CASCADE: Automatically deletes related posts when a user is deleted
     *
     * Message Broker Considerations:
     * Consider using a message broker (Kafka/RabbitMQ) instead of CASCADE when:
     * 1. Other systems need notification of deletion (emails, analytics, cache updates)
     * 2. Implementing soft deletes (marking records as deleted instead of removing)
     * 3. Managing cross-service dependencies in microservices architecture
     */

    try {
        await db.query(createTableQuery);
        console.log('Posts table created successfully');
        
        // Create an index for frequent queries
        await db.query('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
    } catch (error) {
        console.error('Error creating posts table:', error);
        throw error; // Properly propagate the error
    }
}

/**
 * Insert a new post for a user
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {number} user_id - ID of the user creating the post
 * @returns {Promise<Object>} - Created post object
 * @throws {Error} If required parameters are missing or insertion fails
 */
async function insertNewPost(title, content, user_id) {
    if (!title || !user_id) {
        throw new Error('Title and user_id are required');
    }

    const insertPostQuery = `
        INSERT INTO posts(title, content, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    
    /*
     * RETURNING * Benefits:
     * - Eliminates need for separate SELECT query
     * - Provides immediate access to created data
     * - Useful for API responses and logging
     * - Works with INSERT, UPDATE, and DELETE operations
     */

    try {
        const res = await db.query(insertPostQuery, [title, content, user_id]);
        console.log('Post added successfully:', res.rows[0]);
        return res.rows[0];
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            console.error('User does not exist');
        } else {
            console.error('Error adding post:', error);
        }
        throw error;
    }
}

module.exports = {
    createPostsTable,
    insertNewPost
};