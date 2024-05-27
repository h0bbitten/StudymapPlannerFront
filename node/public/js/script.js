export {
  applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveUserDataToDB, Button, APIgetCall, APIpostCall, callToastify, infoBoxListener,
};

// Theme
async function applyTheme() {
  const savedTheme = getCookie('theme');
  if (savedTheme === 'dark') {
    $('body').addClass('dark-mode');
  }

  $('#dark-mode-btn').click(() => {
    toggleDarkMode();
  });

  function toggleDarkMode() {
    $('body').toggleClass('dark-mode');
    if ($('body').hasClass('dark-mode')) {
      setCookie('theme', 'dark', 7);
    } else {
      setCookie('theme', 'light', 7);
    }
  }
}

$('#settingsBtn').click(() => {
  settingsBtn();
});

// Settings button
function settingsBtn() {
  window.location.href = 'settings';
}

// Cookies
function setCookie(name, value, daysToLive) {
  const date = new Date();
  date.setTime(date.getTime() + (daysToLive * 24 * 60 * 60 * 10000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}
function getCookie(name) {
  const cDecoded = decodeURIComponent(document.cookie);
  const cArray = cDecoded.split(';');

  const cookie = cArray.find((element) => element.trim().startsWith(`${name}=`));

  return cookie ? cookie.substring(name.length + 1) : null;
}

// Loading screen
class LoadingScreen {
  static add() {
    $('body').append(`
      <div id="loading-overlay"></div>
      <div id="loading">
        <img src="../img/XOsX.gif" alt="Loading">
      </div>
      `);
  }

  static show() {
    $('#loading').show();
    $('#loading-overlay').show();
  }

  static hide() {
    $('#loading').hide();
    $('#loading-overlay').hide();
  }
}

// Profile display function
function displayProfile(profile) {
  $('#user_profile').html(`<p>Welcome ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`);
}

async function saveUserDataToDB(User) {
  console.log(User);
  try {
    const response = await fetch('http://localhost:3000/saveOptions', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(User),
    });
    if (!response.ok) {
      throw new Error('Network response error');
    }
  } catch (error) {
    console.error('Error saving setup data:', error);
    throw error;
  }
}

// API calls
async function APIpostCall(url, data, errorCallback, contentType = 'application/json') {
  try {
    const response = await fetch(`http://localhost:3000/${url}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': contentType,
      },
      body: data,
    });
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response;
  } catch (error) {
    console.error(errorCallback, error);
    throw error;
  }
}

// API calls
async function APIgetCall(url, errorCallback) {
  try {
    const response = await fetch(`http://localhost:3000/${url}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  } catch (error) {
    console.error(errorCallback, error);
    throw error;
  }
}

class Button {
  constructor(id, text) {
    this.id = id;
    this.text = text;
  }

  addButton() {
    $('#buttons').append(`
      <button id="${this.id}" class="btn btn-primary" style="display: none;">${this.text}</button>
      `);
  }

  showButton() {
    $(`#${this.id}`).show();
  }

  hideButton() {
    $(`#${this.id}`).hide();
  }

  removeButton() {
    $(`#${this.id}`).remove();
  }
}

// function to display a toast message
function callToastify(message) {
  Toastify({
    text: message,
    duration: 1500,
    close: false,
    gravity: 'top',
    position: 'center',
    style: {
      background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
    },
  }).showToast();
}

// function to display a popup with information about the different algorithms
function infoBoxListener() {
  $(document).on('click', '#algoInfo', () => {
    console.log('info clicked');
    const modalContentHTML = `
      <div class="modal-header">Scheduling strategies</div>
      <div class="modal-section">
        <div class="section-title">First come first serve</div>
        <div>
          This scheduling strategy will create a schedule that has dumped the chosen lectures of each course,
          sorted by exam date, with a 1 gap between each lecture.
        </div>
        <img src="../img/AllAlgosGridEvent-FirstComeFirstServeSketch.drawio.png" alt="First come first serve" style="width: 100%">
      </div>
      <div class="modal-section">
        <div class="section-title">5 Day Study Plan</div>
        <div>
          The 5 Day Study Plan will create a schedule that will try to lay the lectures of each course as close to the exam date as possible,
           with a 1 hour gap between each lecture.
        </div>
        <img src="../img/AllAlgosGridEvent-5DayStudyScheduleSketch.drawio.png" alt="5 Day Study Plan" style="width: 100%">
      </div>
      <div class="modal-section">
        <div class="section-title">Strected Schedule (Mixing Allowed)</div>
        <div>
          This scheduling strategy will make use of as much of the time available as possible, with a variable gap between each lecture,
           with a mix of lectures from different courses.
        </div>
        <img src="../img/AllAlgosGridEvent-StrectchedMixSketch.drawio.png" alt="Strected schedule" style="width: 100%">
      </div>
      <div class="modal-section">
        <div class="section-title">Strected Schedule (Mixing Disallowed)</div>
        <div>
          This scheduling strategy will make use of as much of the time available as possible, with a variable gap between each lecture,
           with no mixing of lectures from different courses.
        </div>
        <img src="../img/AllAlgosGridEvent-StrectchedNoMixSketch.drawio.png" alt="Strected schedule" style="width: 100%">
      </div>
    `;
    $('#modalContent').html(modalContentHTML);
    $('#infoModal').css('display', 'flex');
    $('.modal-content').css({
      width: '60vw',
      'overflow-y': 'auto',
      height: '60vh',
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
}
