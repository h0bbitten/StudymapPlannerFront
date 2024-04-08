import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'studymaproot',
    database: 'users'
}).promise;

// Checker om userID allerede er der - update istedet for at klaske ny ind. 
async function ensureUserExists(externalUserID) {
    const [user] = await pool.query('SELECT id FROM users WHERE userID = ?', [externalUserID]);
    if (user.length === 0) {
        const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
        return result.insertId;
    }
    return user[0].id;
}

// Gemmer ellere opdatere course
async function saveOrUpdateCourse(userID, courseName, ects) {
    const [course] = await pool.query('SELECT id FROM courses WHERE userID = ? AND courseName = ?', [userID, courseName]);
    if (course.length === 0) {
        await pool.query('INSERT INTO courses (userID, courseName, ects) VALUES (?, ?, ?)', [userID, courseName, ects]);
    } else {
        await pool.query('UPDATE courses SET ects = ? WHERE id = ?', [ects, course[0].id]);
    }
}

export { ensureUserExists, saveOrUpdateCourse };
