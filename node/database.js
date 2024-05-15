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
          if (result.insertId) {
              console.log(`New user inserted with ID: ${result.insertId}`);
              return result.insertId;
          } else {
              console.log(`Failed to insert new user with ID: ${externalUserID}`);
          }
      } else {
          console.log(`User found with ID: ${externalUserID}, DB ID: ${user[0].id}`);
          return user[0].id;
      }
  } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
  }
}


// Save User Details function
async function saveUserDetails(userId, userDetailsJson) {
  try {
      console.log('Saving these details to MySQL:', userDetailsJson);
      const [result] = await pool.query('UPDATE users SET details = ? WHERE id = ?', [userDetailsJson, userId]);
      if (result.affectedRows === 0) {
          console.error('No rows updated, possible user does not exist');
          return false; // Indicate that the save operation was unsuccessful
      }
      return true;  // Indicate successful update
  } catch (error) {
      console.error('Error updating user details:', error);
      return false;  // Indicate that the save operation failed
  }
}





export { ensureUserExists, saveUserDetails, pool};
