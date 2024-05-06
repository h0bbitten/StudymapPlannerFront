import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: 'mysql',
  user: 'root',
  password: 'rootyroot',
  database: 'users',
});

// Ensure User Exists function
async function ensureUserExists(externalUserID) {
  try {
    console.log(`Checking existence for user ID: ${externalUserID}`);
    const [user] = await pool.query('SELECT id FROM users WHERE userID = ?', [externalUserID]);
    if (user.length === 0) {
      console.log(`No user found with ID: ${externalUserID}, creating new user.`);
      const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
      console.log(`New user inserted with ID: ${result.insertId}`);
      return result.insertId;
    }
    console.log(`User found with ID: ${externalUserID}, DB ID: ${user[0].id}`);
    return user[0].id;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

// Save User Details function
async function saveUserDetails(userId, userDetails) {
  if (!userId || !userDetails) {
      console.error("Invalid user data or ID:", userId, userDetails);
      throw new Error("Invalid user data or ID provided");
  }

  const detailsJson = JSON.stringify(userDetails);
  try {
      const [result] = await pool.query('UPDATE users SET details = ? WHERE id = ?', [detailsJson, userId]);
      if (result.affectedRows === 0) {
          // No rows updated, could mean the user doesn't exist
          console.error('No rows updated - user may not exist or no new data.');
          // Optionally, handle the logic to insert the user if they don't exist
          return { success: false, message: "No rows updated - user may not exist." };
      }
      console.log('User details updated successfully for user ID:', userId);
      return { success: true, message: "User updated successfully." };
  } catch (error) {
      console.error('Error updating user details:', error);
      throw error; // Re-throw the error for further handling up the call stack
  }
}




export { ensureUserExists, saveUserDetails, pool};
