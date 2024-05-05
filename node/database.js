import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: 'mysql',
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
    throw error; 
  }
}

async function saveUserDetails(userId, userDetails) {
  if (!userId || !userDetails) {
    console.error("Invalid user data or ID:", userId, userDetails);
    throw new Error("Invalid user data or ID provided");
  }

  const detailsJson = JSON.stringify(userDetails);
  try {
    const [result] = await pool.query('UPDATE users SET details = ? WHERE id = ?', [detailsJson, userId]);
    if (result.affectedRows === 0) {
      throw new Error("No rows updated - user may not exist.");
    }
    console.log('User details updated successfully for user ID:', userId);
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
}




export { ensureUserExists, saveUserDetails, pool};
