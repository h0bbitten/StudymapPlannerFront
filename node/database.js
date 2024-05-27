import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'studymaproot',
  database: 'users',
});

//function that ensures a user exists in the database
async function ensureUserExists(externalUserID) {
  try {
    console.log(`Trying to ensure user exists with ID: ${externalUserID}`);
    const [user] = await pool.query('SELECT id FROM users WHERE userID = ?', [externalUserID]);
    if (user.length === 0) {
      const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
      console.log(`Inserted new user with ID: ${externalUserID}`);
      return result.insertId;
    }
    console.log(`User already exists with ID: ${externalUserID}, user ID in DB: ${user[0].id}`);
    return user[0].id;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

// Saving or updating a course in the database
async function saveOrUpdateCourse(userID, courseName, ects) {
  const [course] = await pool.query('SELECT id FROM courses WHERE userID = ? AND courseName = ?', [userID, courseName]);
  if (course.length === 0) {
    await pool.query('INSERT INTO courses (userID, courseName, ects) VALUES (?, ?, ?)', [userID, courseName, ects]);
  } else {
    await pool.query('UPDATE courses SET ects = ? WHERE id = ?', [ects, course[0].id]);
  }
}

export { ensureUserExists, saveOrUpdateCourse };
