export {
  applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveUserDataToDB, Button, APIgetCall,
};

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

function displayProfile(profile) {
  $('#user_profile').html(`<p>Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`);
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