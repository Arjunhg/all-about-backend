const db = require('../db/db');

/**
 * Get users who have posted content using INNER JOIN
 * @returns {Promise<Array>} Array of users with their posts
 * @throws {Error} If query fails
 */
async function getUsersWithPost() {
    const getUserQuery = `
        SELECT 
            users.id,
            users.username,
            users.email,
            posts.id AS post_id,
            posts.title,
            posts.created_at AS post_date
        FROM users
        INNER JOIN posts ON users.id = posts.user_id
        ORDER BY posts.created_at DESC
    `;

    try {
        const res = await db.query(getUserQuery);
        console.log(`Found ${res.rows.length} users with posts`);
        return res.rows;
    } catch (error) {
        console.error('Error executing INNER JOIN query:', error);
        throw error;
    }
}

/**
 * Get all users and their posts (if any) using LEFT JOIN
 * @returns {Promise<Array>} Array of all users with their posts (or default values)
 * @throws {Error} If query fails
 */
async function getAllUsersAndTheirPosts() {
    const getUserQuery = `
        SELECT 
            users.id,
            users.username,
            users.email,
            COUNT(posts.id) AS post_count,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'post_id', posts.id,
                        'title', posts.title,
                        'created_at', posts.created_at
                    )
                ) FILTER (WHERE posts.id IS NOT NULL),
                '[]'
            ) AS posts
        FROM users
        LEFT JOIN posts ON users.id = posts.user_id
        GROUP BY users.id, users.username, users.email
        ORDER BY users.username
    `;
    /*
    --> JSON_AGG() aggregates all values, including NULL values.
        If we don’t use FILTER, users without posts will get [null] instead of [].
        This avoids NULL values inside the JSON array.
    --> JSON_BUILD_OBJECT() creates a JSON object with the specified keys and values.
    --> JSON_AGG() collects all JSON objects into an array.
    */

    try {
        const res = await db.query(getUserQuery);
        console.log(`Retrieved data for ${res.rows.length} users`, res.rows);
        /*
        const replacer = (key, value) => {
            if(key==="username") return undefined;
            return value;
        }
        console.log(`Retrieved data for ${res.rows.length} users`, JSON.stringify(res.rows, replacer, 2));
        */
        //console.log(`Retrieved data for ${res.rows.length} users`, JSON.stringify(res.rows, null, 2)); or
        // console.dir( res.rows, {depth: null});

        return res.rows;
    } catch (error) {
        console.error('Error executing LEFT JOIN query:', error);
        throw error;
    }
}

/**
 * Get user post statistics using aggregation and joins
 * @returns {Promise<Array>} Array of user statistics
 * @throws {Error} If query fails
 */
async function getUserPostStats() {
    const statsQuery = `
        SELECT 
            users.username,
            COUNT(posts.id) AS total_posts,
            MAX(posts.created_at) AS last_post_date,
            MIN(posts.created_at) AS first_post_date
        FROM users
        LEFT JOIN posts ON users.id = posts.user_id
        GROUP BY users.id, users.username
        HAVING COUNT(posts.id) > 0
        ORDER BY total_posts DESC
    `;

    try {
        const res = await db.query(statsQuery);
        return res.rows;
    } catch (error) {
        console.error('Error getting user statistics:', error);
        throw error;
    }
}

/**
 * Find posts by username with JOIN
 * @param {string} username - Username to search for
 * @returns {Promise<Array>} Array of posts by the user
 * @throws {Error} If username is missing or query fails
 */
async function findPostsByUsername(username) {
    if (!username) {
        throw new Error('Username is required');
    }

    const findPostsQuery = `
        SELECT 
            posts.id,
            posts.title,
            posts.content,
            posts.created_at,
            users.username,
            users.email
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        WHERE users.username = $1
        ORDER BY posts.created_at DESC
    `;

    try {
        const res = await db.query(findPostsQuery, [username]);
        console.log(`Found ${res.rows.length} posts for user ${username}`);
        return res.rows;
    } catch (error) {
        console.error('Error finding posts by username:', error);
        throw error;
    }
}

module.exports = {
    getUsersWithPost,
    getAllUsersAndTheirPosts,
    getUserPostStats,
    findPostsByUsername
};