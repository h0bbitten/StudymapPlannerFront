import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rootyroot',
  database: 'users',
});

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

async function saveUserDetails(userID, userData) {
  try {
      const userDetailsJSON = JSON.stringify(userData);

      // Update the user's details in the database
      const [result] = await pool.query(`
          UPDATE users SET details = ? WHERE userID = ?`,
          [userDetailsJSON, userID]
      );

      console.log('User details saved successfully:', result);
      return result;
  } catch (error) {
      console.error('Error saving user details:', error);
      throw error;
  }
}

export { ensureUserExists, saveUserDetails };
