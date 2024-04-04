import {applyTheme} from './script.js';
import {getToken} from '../database.js';

//Login function
function handleLogin() {
    let loginBtn = document.getElementById("tokenButn");
    
    loginBtn.addEventListener("click", async () => {
        let token = document.getElementById("tokenInput").value;
        let isValid = await validToken(token);
        if (isValid) {
            await postTokenToDatabase(token); // Post token to the database if it's valid
            window.location.href = "schedule";
        };
    });
}


async function validToken(token) {
    console.log(`Checking token: ${token}`);
    // Check if the token input field is empty
    if (token.trim() === "") {
        Toastify({
            text: "Please enter a valid token.",
            duration: 1500,
            close: false,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            }
        }).showToast();
        return false;
    }
    // Check if token is valid
    try {
        token = token.trim(" ");
        let response = await testToken(token);
        console.log(response);
        if (response === 'Invalid Token') {
            Toastify({
                text: "Invalid Token.",
                duration: 1500,
                close: false,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                }
            }).showToast();
            return false;
        }
        else {
            return true;
        }
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

async function testToken(token) {
    try {
        let response = await fetch(`http://localhost:3000/testToken?token=${token}`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        const data = await response.text();
        return data;
      } 
      catch (error) {
        console.error('Error fetching token validity:', error);
        throw error;
    }
}

async function postTokenToDatabase(token) {
    try {
        await getToken(token);
        console.log('Token posted to the database successfully.');
    } catch (error) {
        console.error('Error posting token to the database:', error);
    }
}

applyTheme();
handleLogin();