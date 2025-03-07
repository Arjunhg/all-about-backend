
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

async function insertUser(username, email){
    
    const insertUser = `
        INSERT INTO users(username, email)
        VALUES ($1, $2)
        RETURNING *
    `
    /* $ are placeholder and * is clause to return all columns
        -> Using parameterized queries with $1, $2 prevents SQL injection attacks by safely handling user inputs.
        -> Without RETURNING *, you’d need to run another SELECT query to retrieve the inserted row.
    */

        try {
            const res = await db.query(insertUser, [username, email]);
            console.log('User added successfully', res.rows[0]);
            return res.rows[0];
        } catch (error) {
            console.error('Error adding user', error);
        }
}

async function fetchAllUsers(){
    
    const getAllUsers = `
        SELECT * FROM users
    `

    try {
        const res = await db.query(getAllUsers);
        console.log('Column Names:', res.fields.map(field => field.name));
        console.log('All users fetched successfully', res.rows);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all users', error);
    }
}

async function updateUserEmail(username, newEmail){

    const updateUserQuery = `
        UPDATE users 
        SET email = $2
        WHERE username = $1
        RETURNING *
    `

    try {
        const res = await db.query(updateUserQuery, [username, newEmail]);
        
        if(res.rows.length > 0){
            console.log('User email updated successfully', res.rows[0]);
            return res.rows[0];
        }else{
            console.log('User not found with the provided username');
            return null;
        }

        return res.rows[0];
    } catch (error) {
        console.error('Error updating user email', error);
    }
}

async function deleteInfo(username){

    const deletedQuery = `
        DELETE FROM users
        WHERE username = $1
        RETURNING *
    `

    try {
        const res = await db.query(deletedQuery, [username]);

        if(res.rows.length > 0){
            console.log('User deleted successfully', res.rows[0]);
            return res.rows[0];
        }else{
            console.log('User not found with the provided username');
            return null;
        }

    } catch (error) {
        console.error('Error deleting user', error);
    }
}


module.exports = {createUsersTable, insertUser, fetchAllUsers, updateUserEmail, deleteInfo};