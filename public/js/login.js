import { applyTheme } from './script.js';
import { Pool } from 'pg';

// PostgreSQL database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'studymapplannerfront',
  password: 'Flyvfisken1',
  port: 5432, // default PostgreSQL port
});

// Login function
async function handleLogin() {
    let loginBtn = document.getElementById("tokenButn");
    
    loginBtn.addEventListener("click", async () => {
        // Get token from input field
        let token = document.getElementById("tokenInput").value;
        let isValid = await validToken(token);
        console.log(isValid);
        if (isValid) {
            // Save token in temporary session storage, and link to schedule
            sessionStorage.setItem("token", token);
            window.location.href = "schedule";
        };
    });
}

// Validate token function
async function validToken(token) {
    console.log(`Checking token: ${token}`);
    // Check if the token input field is empty
    if (token.trim() === "") {
        // Display error message
        displayErrorMessage("Please enter a valid token.");
        return false;
    }
    // Check if token is valid
    try {
        token = token.trim();
        let userData = await getUserDataByToken(token);
        if (!userData) {
            // Display error message
            displayErrorMessage("Invalid token.");
            return false;
        }
        // Token is valid, you can perform additional checks if needed
        return true;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

// Fetch user data from database using token
async function getUserDataByToken(token) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE token = $1', [token]);
        return result.rows[0]; // Assuming only one user for a given token
    } finally {
        client.release();
    }
}

// Display error message using Toastify
function displayErrorMessage(message) {
    Toastify({
        text: message,
        duration: 1500,
        close: false,
        gravity: "top",
        position: "center",
        style: {
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
        }
    }).showToast();
}

applyTheme();
handleLogin();
