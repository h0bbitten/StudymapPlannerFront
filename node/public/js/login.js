import { applyTheme, APIgetCall, callToastify } from './script.js';

// Login function
function handleLogin() {
  const loginBtn = document.getElementById('tokenButn');

  loginBtn.addEventListener('click', async () => {
    // Get token from input field
    const token = $('#tokenInput').val();
    const answer = await validToken(token);
    if (answer.validity) {
      window.location.href = answer.redirect;
    }
  });
}

async function validToken(token) {
  console.log(`Checking token: ${token}`);
  // Check if the token input field is empty
  if (token.trim() === '') {
    // eslint-disable-next-line no-undef
    callToastify('Please enter a valid token.');
    return false;
  }
  // Check if token is valid
  try {
    token = token.trim(' ');
    const response = await APIgetCall(`getLogIn?token=${token}`, 'Error fetching token validity');
    console.log(response.validity);
    if (response.validity === 'Invalid Token') {
      callToastify('Invalid Token.');
      return false;
    }

    return response;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

applyTheme();
handleLogin();
