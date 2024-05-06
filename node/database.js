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
    console.log("User query result:", user);
    if (user.length === 0) {
      console.log("No existing user found, creating new user.");
      const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
      console.log(`Inserted new user with ID: ${externalUserID}, new ID in DB: ${result.insertId}`);
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
  console.log('Saving details for user:', userId);
  const detailsJson = JSON.stringify(userDetails);

  try {
    const [result] = await pool.query('UPDATE users SET details = ? WHERE id = ?', [detailsJson, userId]);
    console.log('Affected Rows:', result.affectedRows);
    if (result.affectedRows === 0) {
      console.error("No rows updated - user may not exist.");
      throw new Error("No rows updated - user may not exist.");
    }
    return true;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
}




export { ensureUserExists, saveUserDetails, pool};
