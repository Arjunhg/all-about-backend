
const db = require('../db/db');

async function createUsersTable(){

    // query table with columns as specified in the createTableQuery
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users( 
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email varchar(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `

    // Now create the table
    try {
        await db.query(createTableQuery);
        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating users table', error);
    }
}

module.exports = {createUsersTable};