import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'studymaproot',
  database: 'userData',
});

// Ensures that the user exists or inserts a new one if not.
async function ensureUserExists(externalUserID) {
  try {
      const [user] = await pool.query('SELECT id FROM users WHERE userID = ?', [externalUserID]);
      if (user.length === 0) {
          const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
          console.log(`Inserted new user with ID: ${result.insertId}`);
          return result.insertId;  // Return the new user ID.
      }
      console.log(`User already exists with ID: ${externalUserID}, DB ID: ${user[0].id}`);
      return user[0].id;  // Return existing user ID.
  } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error; // Important to throw errors to handle them in calling function.
  }
}

// Updates the user details in the database.
async function saveUserDetails(userId, userDetails) {
  const userDetailsJson = JSON.stringify(userDetails);  // Convert userDetails object to JSON string.
  try {
      const [result] = await pool.query('UPDATE users SET details = ? WHERE userID = ?', [userDetailsJson, userId]);
      if (result.affectedRows === 0) {
          console.error(`No rows updated for User ID: ${userId}. User might not exist or data has not changed.`);
          return false; // Return false if no rows were updated.
      }
      console.log(`User details updated successfully for User ID: ${userId}`);
      return true; // Return true if update was successful.
  } catch (error) {
      console.error('Error updating user details:', error);
      return false;
  }
}






export { ensureUserExists, saveUserDetails, pool };
