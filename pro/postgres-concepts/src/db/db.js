require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool with improved configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Set maximum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000 // 5 seconds connection timeout
});

// Add basic error handling for the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Execute database query with improved error handling
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params) {
    const start = Date.now();
    let client;

    try {
        // Get client from pool
        client = await pool.connect();
        
        // Execute query
        const res = await client.query(text, params);
        
        // Calculate query duration
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error; // Properly propagate the error
    } finally {
        // Always release the client back to the pool
        if (client) {
            client.release();
        }
    }
}

/**
 * Execute multiple queries in a transaction
 * This function lets you run multiple database operations as a single atomic unit, ensuring that either all operations succeed or none of them do. The key benefit is data integrity - it prevents your database from ending up in an inconsistent state.
 * @param {Function} callback - Function that receives client and executes queries
 * @returns {Promise<*>} - Result of transaction
 */
async function transaction(callback) {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Execute callback with transaction client
        const result = await callback(client);
        
        // Commit transaction
        await client.query('COMMIT');
        
        return result;
    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('Transaction error:', error);
        throw error;
    } finally {
        // Release client
        client.release();
    }
}

// Clean up pool on application shutdown
process.on('SIGINT', () => {
    pool.end().then(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

module.exports = { query, transaction };