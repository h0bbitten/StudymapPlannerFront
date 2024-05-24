import { applyTheme, APIgetCall, callToastify } from './script.js';

// Login function
function handleLogin() {
  const loginBtn = document.getElementById('tokenButn');

  loginBtn.addEventListener('click', async () => {
    // Get token from input field
    const token = $('#tokenInput').val();
    const answer = await validToken(token);
    if (answer.validity) {
      console.log(answer.redirect);
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

const tutorialBtn = document.getElementById('tutorial_id');
tutorialBtn.addEventListener('click', () => {
  const modalContentHTML = `
    <div class="modal-header">How to find your Moodle token</div>
    <div class="modal-section">
      <video width="1220" height="640" controls>
        <source src="/img/tokenTutorial.mp4" type="video/mp4">
        <source src="/img/tokenTutorial.mp4" type="video/ogg">
        Your browser does not support the video tag.
      </video>
    </div>
  `;
  $('#modalContent').html(modalContentHTML);
  $('#infoModal').css('display', 'flex');
  $('.modal-content').css({
    width: '60vw',
    'overflow-y': 'auto',
    height: '80vh',
  });
});
  $(document).keydown((event) => {
    if (event.key === 'Escape') {
      closePopup();
    }
  });
  $('.close').on('click', closePopup);
  function closePopup() {
    $('#infoModal').css('display', 'none');
  }

applyTheme();
handleLogin();
