import {applyTheme} from './script.js';

//Login function
function handleLogin() {
    let loginBtn = document.getElementById("tokenButn");
    
    loginBtn.addEventListener("click", async () => {
        //Get token from input field
        let token = document.getElementById("tokenInput").value;
        let isValid = await validToken(token);
        console.log(isValid);
        if (isValid) {
            //Save token in temp session storage, and link to schedule
            sessionStorage.setItem("token", token);
            window.location.href = "schedule";
        };
    });
}

async function validToken(token) {
    console.log(`Checking token: ${token}`);
    // Check if the token input field is empty
    if (token.trim() === "") {
        alert("Please enter a valid token.");
        return false;
    }
    // Check if token is valid
    try {
        token = token.trim(" ");
        let tokenTry = await core_calendar_get_calendar_events(token);
        if (tokenTry.errorcode === 'invalidtoken') {
            alert("Invalid token.");
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

async function core_calendar_get_calendar_events(token) {
    try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=core_webservice_get_site_info`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        return response.json();
      } 
      catch (error) {
        console.error('Error fetching calendar events :', error);
        throw error;
    }
}
applyTheme();
handleLogin();
