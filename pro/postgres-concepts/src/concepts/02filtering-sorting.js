const db = require('../db/db');

// WHERE Clause
async function getUsersWhere(condition){
    const getUsersQuery = `
        SELECT * from users
        WHERE ${condition}
    `
    try {
        const res = await db.query(getUsersQuery);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all users', error);
    }
}

async function getSortedUsers(column, order = "ASC"){

    /*
    const getUsersQuery = `
        select * from users
        order by ${column} ${order}
    `
    // PostgreSQL placeholders ($1, $2, etc.) are only for values (e.g., user input for filtering). They cannot be used for SQL keywords (ASC/DESC) or column names.
    */
    //Secure versiion
    const validColumn = ["id", "username", "email", "created_at", "updated_at"];
    const validOrder = ["ASC", "DESC"];

    if(!validColumn.includes(column)){
        throw new Error("Invalid column");
    }
    if(!validOrder.includes(order)){
        throw new Error("Invalid order");
    }

    const getUsersQuery = `
        select * from users
        order by ${column} ${order}
    `
    try {
        const res = await db.query(getUsersQuery);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all users', error);
    }
}

async function getPaginatedUsers(limit, offset){
    const getUsersQuery = `
        SELECT * FROM users
        LIMIT $1 OFFSET $2
    `
    try {
        const res = await db.query(getUsersQuery, [limit, offset]);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all users', error);
    }
}

module.exports = {getUsersWhere, getSortedUsers, getPaginatedUsers};