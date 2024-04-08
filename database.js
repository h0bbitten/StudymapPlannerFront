import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'studymaproot',
    database: 'users'
}).promise();

// Ensures the user exists in the database based on external userID.
// It either finds an existing user or inserts a new record.
export async function ensureUserExists(externalUserID) {
    try {
        let [results] = await pool.query(`SELECT id FROM users WHERE userID = ?`, [externalUserID]);
        if (results.length === 0) {
            // User does not exist, insert them
            const [insertResult] = await pool.query(`INSERT INTO users (userID) VALUES (?)`, [externalUserID]);
            console.log(`New user inserted with ID: ${insertResult.insertId}`);
            return insertResult.insertId; // Returning internal DB ID for further operations
        } else {
            // User exists
            console.log(`User already exists with ID: ${results[0].id}`);
            return results[0].id; // Returning internal DB ID for further operations
        }
    } catch (error) {
        console.error('Error ensuring user exists:', error);
        throw error;
    }
}

// Inserts course data linked to a specific internal user ID.
export async function saveCourseData(internalUserID, courseName, ects) {
    try {
        await pool.query(`INSERT INTO courses (userID, courseName, ects) VALUES (?, ?, ?)`, [internalUserID, courseName, ects]);
        console.log(`Course data saved for userID: ${internalUserID}`);
    } catch (error) {
        console.error('Error saving course data:', error);
        throw error;
    }
}
