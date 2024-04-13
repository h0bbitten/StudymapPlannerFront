import {applyTheme, APIgetCall} from './script.js';

//Login function
function handleLogin() {
    let loginBtn = document.getElementById("tokenButn");
    
    loginBtn.addEventListener("click", async () => {
        //Get token from input field
        let token = $('#tokenInput').val();
        let answer = await validToken(token);
        if (answer.validity) {
            window.location.href = answer.redirect;
        }
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
        let response = await APIgetCall(`getLogIn?token=${token}`, 'Error fetching token validity');
        console.log(response.validity);
        if (response.validity === 'Invalid Token') {
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
            return response;
        }
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

applyTheme();
handleLogin();