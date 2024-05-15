export {
  applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveUserDataToDB, Button, APIgetCall, APIpostCall, callToastify, infoBoxListener, Export,
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

function callToastify(message) {
  // eslint-disable-next-line no-undef
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

function Export() {
  console.log('Starting script...');

  // Fetch the JSON file
  console.log('Fetching JSON file...');
  fetch('/database/147291.json')
    .then(response => response.json())
    .then(data => {
      console.log('Reading JSON file...');

      // Extract schedule information
      console.log('Creating calendar...');
      const cal = ical({ name: 'Course Schedule' });

      console.log('Extracting schedule information...');
      data.courses.forEach(course => {
        course.contents.forEach(module => {
          if (module.summary) {
            const summary = module.summary;
            const startTimeMatch = summary.match(/startTime:\s*([^\s,]+)/);
            const endTimeMatch = summary.match(/endTime:\s*([^\s,]+)/);

            if (startTimeMatch && endTimeMatch) {
              const startTime = new Date(startTimeMatch[1]);
              const endTime = new Date(endTimeMatch[1]);
              const title = module.name || 'No Title';

              console.log(`Adding event: ${title} from ${startTime} to ${endTime}`);

              // Add event to the calendar
              cal.createEvent({
                start: startTime,
                end: endTime,
                summary: title
              });
            }
          }
        });
      });

      // Convert calendar to string
      const calendarString = cal.toString();

      // Save the iCal file (you may need to adjust this part)
      console.log('Saving iCal file...');
      const blob = new Blob([calendarString], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedule.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('iCal file created successfully');
    })
    .catch(error => {
      console.error('Error fetching JSON file:', error);
    });
}
