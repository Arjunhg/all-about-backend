require('dotenv').config();
const { Pool } = require('pg'); //manages pool of multiple postgre client connections

// create a new pool instance to manage the connections
/*
    -> postgres -> :// -> [user] -> [password] -> @ -> host:port -> [database] 
*/
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

async function query(text, params){
    const start = Date.now();

    try {
        
        const res = await pool.query(text, params);

        // execute the time
        const duration = Date.now() - start;

        console.log('executed query', { text, duration, rows: res.rowCount });
        
    } catch (error) {
        
        console.log(error);
        throw error;
    }
}

module.exports = { query };