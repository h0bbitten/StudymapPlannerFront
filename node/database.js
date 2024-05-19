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
    const [users] = await pool.query('SELECT userID FROM users WHERE userID = ?', [externalUserID]);
    if (users.length === 0) {
      console.log(`No user found with userID: ${externalUserID}, creating new user.`);
      const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
      console.log(`New user inserted with userID: ${externalUserID}`);
      return externalUserID;  // Return the external userID
    } else {
      console.log(`User found with userID: ${externalUserID}`);
      return externalUserID;  // Return the found userID
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}



// Updates the user details in the database.
async function saveUserDetails(userID, userDetails) {
  const userDetailsJson = JSON.stringify(userDetails);  // Convert userDetails object to JSON string.
  try {
    const [result] = await pool.query('UPDATE users SET details = ? WHERE userID = ?', [userDetailsJson, userID]);
    if (result.affectedRows === 0) {
      console.error(`No rows updated for userID: ${userID}. User might not exist or data has not changed.`);
      return false; // Return false if no rows were updated.
    }
    console.log(`User details updated successfully for userID: ${userID}`);
    return true; // Return true if update was successful.
  } catch (error) {
    console.error('Error updating user details:', error);
    return false;
  }
}






export { ensureUserExists, saveUserDetails, pool };
