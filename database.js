import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'studymaproot',
    database: 'users'
}).promise();

export async function getToken(token) {
    try {
        const [result] = await pool.query(`
            INSERT INTO users (token)
            VALUES (?)
        `, [token]);
        const id = result.insertId;
        console.log(`Token inserted with ID: ${id}`);
        return id; // Return the ID of the inserted token
    } catch (error) {
        console.error('Error inserting token:', error);
        throw error;
    }
}


async function getUsers() {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM users');
        console.log(rows); // Log the data retrieved from the users table
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
}

getUsers(); // Call the getUsers function to retrieve and log the data from the users table