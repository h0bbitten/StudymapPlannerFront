import {applyTheme} from './script.js';

//Login function
function handleLogin() {
    let loginBtn = document.getElementById("tokenButn");
    
    loginBtn.addEventListener("click", () => {
        //Get token from input field
        let token = document.getElementById("tokenInput").value;

        //Check if the token imput field is empty
        if (token.trim() === "") {
            alert("Please enter a valid token.");
            return;
        }
        //Save token in temp session storage, and link to schedule
        sessionStorage.setItem("token", token);
        window.location.href = "schedule.html";
    });
}

applyTheme();
handleLogin();
