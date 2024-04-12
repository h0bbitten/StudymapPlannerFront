export {applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveUserDataToDB, Button, APIgetCall};

//Dark mode toggle
async function applyTheme() {
  // Check for saved theme preference on page load
  const savedTheme = getCookie("theme");
  if (savedTheme) {
    $('#theme-style').attr('href', savedTheme);
  }

  $('#dark-mode-btn').click(function() {
    toggleDarkMode();
  });

  function toggleDarkMode() {
    const themeStyle = $('#theme-style');
    const currentTheme = themeStyle.attr('href');
    const darkTheme = '../css/darkstyle.css';
    const lightTheme = '../css/style.css';

    // Switch between themes
    const newTheme = currentTheme === lightTheme ? darkTheme : lightTheme;
    themeStyle.attr('href', newTheme);

    // Save theme preference in a cookie
    setCookie("theme", newTheme, 365); // Cookie expires in a year
  }
}

$('#settingsBtn').click(function() {
  settingsBtn();
});

function settingsBtn() {
  window.location.href = 'settings';
}

//Cookies
function setCookie(name, value, daysToLive){
  const date = new Date();
  date.setTime(date.getTime()+ (daysToLive * 24 * 60 * 60 * 10000));
  let expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`
}
function getCookie(name) {
  const cDecoded = decodeURIComponent(document.cookie);
  const cArray = cDecoded.split(";");
  
  for (let element of cArray) {
    const cookie = element.trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

//Loading screen
class LoadingScreen {
  add() {
      $("body").append(`
      <div id="loading-overlay"></div>
      <div id="loading">
        <img src="../img/XOsX.gif" alt="Loading">
      </div>
      `);
  }
  show() {
    $("#loading").show();
    $("#loading-overlay").show();
  }

  hide() {
    $("#loading").hide();
    $("#loading-overlay").hide();
  }
}

function displayProfile(profile) {
  $("#user_profile").html(`<p>Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`);
}


async function saveUserDataToDB(User) {
  console.log(User);
  try {
      let response = await fetch(`http://localhost:3000/saveOptions`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(User)
      });
      if (!response.ok) {
          throw new Error('Network response error');
      }
  } 
  catch (error) {
      console.error('Error saving setup data:', error);
      throw error;
  }
}

async function APIgetCall(url, errorCallback){
  try {
    const response = await fetch(`http://localhost:3000/${url}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  } 
  catch (error) {
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
      $("#buttons").append(`
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