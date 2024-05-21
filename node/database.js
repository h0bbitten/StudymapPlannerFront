import mysql from 'mysql2/promise';


const pool = mysql.createPool({
  host: 'mysql',
  user: 'root',
  password: 'rootyroot',
  database: 'userData',
});


async function ensureUserExists(externalUserID) {
  try {
    const [users] = await pool.query('SELECT userID FROM users WHERE userID = ?', [externalUserID]);
    if (users.length === 0) {
      console.log(`No user found with userID: ${externalUserID}, creating new user.`);
      const [result] = await pool.query('INSERT INTO users (userID) VALUES (?)', [externalUserID]);
      console.log(`New user inserted with userID: ${externalUserID}`);
      return externalUserID; 
    } else {
      console.log(`User found with userID: ${externalUserID}`);
      return externalUserID;
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}




async function saveUserDetails(userID, userDetails) {
  const userDetailsJson = JSON.stringify(userDetails); 
  try {
    const [result] = await pool.query('UPDATE users SET details = ? WHERE userID = ?', [userDetailsJson, userID]);
    if (result.affectedRows === 0) {
      console.error(`No rows updated for userID: ${userID}. User might not exist or data has not changed.`);
      return false; 
    }
    console.log(`User details updated successfully for userID: ${userID}`);
    return true; 
  } catch (error) {
    console.error('Error updating user details:', error);
    return false;
  }
}






export { ensureUserExists, saveUserDetails, pool };
