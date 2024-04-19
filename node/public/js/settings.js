import {
  applyTheme, LoadingScreen, displayProfile, saveUserDataToDB, APIgetCall, APIpostCall,
} from './script.js';

async function displaySettings(User) {
  LoadingScreen.add();
  LoadingScreen.show();
  displayCourses(User.courses);
  displayStudyTime(User.settings);
  displaySyncCalendar(User.userid, User.settings);
  displayImportExport(User.userid, User.settings);
  displayAccountSettings(User.userid, User.settings);
  $('input[type="checkbox"]').each(subCheckboxChange);
  $('.optionBlock').prepend('<div class="optionBlockPadding"></div>');
  $('.optionBlock').append('<div class="optionBlockPadding"></div>');
  LoadingScreen.hide();
}

function createCollapsible(name, id, addclass = '') {
  const HTML = `
  <div class="collapsible-container" id="${id}">
    <div class="collapsible ${addclass}">
      <span>${name}</span>
      <span class="carot-collapsible">
        <svg fill="#000000" width="20px" height="20px" viewBox="0 0 256 256" id="carot">
          <path d="M128,188a11.96187,11.96187,0,0,1-8.48535-3.51465l-80-80a12.0001,12.0001,
            0,0,1,16.9707-16.9707L128,159.0293l71.51465-71.51465a12.0001,12.0001,0,0,1,16.9707,16.9707l-80,
            80A11.96187,11.96187,0,0,1,128,188Z">
          </path>
        </svg>
      </span>
    </div>
  </div>`;
  return HTML;
}

function displayCourses(courses) {
  $('#formSettings').append(createCollapsible('Courses and Lectures', 'courses'));
  $('#courses').append('<div class="optionBlock courseContainer"></div>');
  courses.forEach((course, index) => {
    $('#courses .optionBlock').first().append(createCollapsible(course.fullnamedisplay, course.id));
    $(`#${course.id} .optionTitle`).prepend(`<input type="checkbox" id="checkboxTitle${index}" value=${index} class="checkboxTitle">`);
    $(`#${course.id}`).append(`<div class="optionBlock lecturelist" id="course${index}"></div>`);

    course.contents.forEach((lecture, k) => {
      $(`#course${index}`).append(`
            <div class="checkbox checkbox-container">
              <label class="checkbox-label" for="checkbox${k}">
                <input type="checkbox" id="checkbox${k}-forList${index}"
                  class="subCheckbox" name="type" value="${k}" ${lecture.chosen ? 'checked' : ''}/>
                <span id="checkbox${k}Text">${lecture.name}</span>              
              </label>
            </div>
        `);
    });
  });
}

function displayStudyTime(settings) {
  $('#formSettings').append(createCollapsible('Study Time', 'studyTime'));
  $('#studyTime').append(`
    <div class="optionBlock">
      <label class="optionInput" for="startStudyTime">
        <input type="time" id="startStudyTime" name="startStudyTime" value="${settings.startStudyTime}"/>
        <span>Start study time</span>              
      </label>
      <label class="optionInput" for="endStudyTime">
        <input type="time" id="endStudyTime" name="endStudyTime" value="${settings.endStudyTime}"/>
        <span>End study time</span>              
      </label>
    </div>
  `);
  console.log(settings);
}

function displayAccountSettings(id, settings) {
  $('#formSettings').append(createCollapsible('Account', 'accountSettings'));
  $('#accountSettings').append(`
    <div class="optionBlock" id="accountSettingsInputs">
      <label class="optionInput" for="email">
        <span>Change Email</span>              
        <input type="email" id="useremail" name="email" placeholder"example@gmail.com"
        value="${settings.email || ''}" ${!settings.email ? 'required="false"' : ''}/>
      </label>
      <label class="optionInput" for="logout&removeData">
        <a id="logout" class="btn btn-primary" href="/logout">Logout</a>
        <button id="removedata" class="btn btn-primary" href="/removeData">Delete all stored data</button>                            
      </label>
    </div>
  `);
  $('#logout').css({ 'background-color': 'orange', color: 'white' });
  $('#removedata').css({ 'background-color': 'red', color: 'white' });
}

function displaySyncCalendar(userid, settings) {
  $('#formSettings').append(createCollapsible('Sync Calendar', 'syncCalendar'));
  $('#syncCalendar').append(`
    <div class="optionBlock" id="syncCalendarInputs">
      <span>Input URL of calendar in iCal format</span>
      <a href="https://support.google.com/calendar/answer/37648?hl=en#zippy=%2Cget-your-calendar-view-only">Guide to get Google Calendar link</a>
    </div>
  `);
  settings.syncCalendars.forEach((calendar, index) => {
    $('#syncCalendarInputs').append(addSyncCalendarInput(index, calendar.url, calendar.name, calendar.color));
  });
  if (settings.syncCalendars.length === 0) {
    $('#syncCalendarInputs').append(addSyncCalendarInput());
  }
  $('#syncCalendarInputs').append(plusButton('syncCalendarPlus', 'Add new calendar'));
}

function addSyncCalendarInput(index = 0, url = '', name = '', color = '#385280') {
  const HTML = `
  <div class="optionInput SyncCalendarInput">
    <label for="syncCalendarUrl${index}">
      <p>Url:</p>
      <input type="text" id="syncCalendarUrl${index}" placeholder="URL of calendar" value="${url}">
    </label>  
    <label for="syncCalendarName${index}">
      <p>Name:</p>
      <input type="text" id="syncCalendarName${index}" placeholder="Name for calendar" value="${name}">
    </label>
    <label for="syncCalendarColor${index}">
      <p>Color:</p>
      <input type="color" id="syncCalendarColor${index}" value="${color}">
    </label>  
  </div>`;
  return HTML;
}

function plusButton(id, text = '') {
  const HTML = `
    <label for="${id}">
      <button type="button" class="btn plusBtn" id="${id}">${text}<span>+</span></button>
    </label>`;
  return HTML;
}

function displayImportExport(userid, settings) {
  $('#formSettings').append(createCollapsible('Import/Export iCal file', 'importExport'));
  $('#importExport').append(`
    <div class="optionBlock" id="importExportInputs">
      <div class="optionInput" for="importIcalFile">
        <span id="importText">Import Data</span>
        <input type="file" id="importIcalFile" name="importIcalFile" accept=".ics" multiple/>
      </div>
      <label class="optionInput" for="exportIcalFile">
        <a id="exportIcalFile" class="btn btn-primary" href="/exportIcalFile">Export Data</a>                            
      </label>
    </div>
  `);
}

function collapseListener() {
  $('.collapsible').on('click', function listener(event) {
    if (!event.target.matches('input[type="checkbox"]')) {
      this.classList.toggle('active');
      const optionBlock = this.nextElementSibling;
      optionBlock.classList.toggle('active');
      const carot = this.querySelector('.carot-collapsible');
      if (optionBlock.style.maxHeight) {
        optionBlock.style.maxHeight = null;
        carot.style.transform = 'rotate(0deg)';
      } else {
        optionBlock.style.maxHeight = `${optionBlock.scrollHeight}px`;
        carot.style.transform = 'rotate(180deg)';
        $(window).trigger('resize');
      }
      if (optionBlock.classList.contains('active') && optionBlock.classList.contains('lecturelist')) {
        const courses = $('.courseContainer');
        const maxHeight = courses.css('max-height');
        const newHeight = optionBlock.scrollHeight + maxHeight;
        courses.css('max-height', newHeight);
      }
    }
  });
}

function titleCheckboxChange() {
  const $checkbox = $(this);
  if ($checkbox.hasClass('checkboxTitle')) {
    const course = $checkbox.attr('value');
    const $subCheckboxes = $(`#course${course} .subCheckbox`);

    $subCheckboxes.prop('checked', $checkbox.prop('checked'));
  }
}

function subCheckboxChange() {
  const $checkbox = $(this);
  if ($checkbox.hasClass('subCheckbox')) {
    const id = $checkbox.attr('id');
    const course = id.match(/\d+$/)[0];

    const $subCheckboxes = $(`#course${course} input[type="checkbox"]`);
    const isChecked = $subCheckboxes.is(':checked');
    $(`#checkboxTitle${course}`).prop('checked', isChecked);
  }
}
function checkboxListener() {
  $(document).on('change', 'input[type="checkbox"]', handleCheckboxChange);
}
function handleCheckboxChange() {
  subCheckboxChange.call(this);
  titleCheckboxChange.call(this);
}

function toastifyError(message) {
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

function plusButtonListener() {
  $('#syncCalendarPlus').on('click', () => {
    const syncCalendarInputs = $('#syncCalendarInputs .SyncCalendarInput');
    let valid = true;
    syncCalendarInputs.each((index, input) => {
      const url = $(input).find(`#syncCalendarUrl${index}`).val();
      const name = $(input).find(`#syncCalendarName${index}`).val();
      if (url === '' || name === '') {
        valid = false;
        toastifyError('Please enter valid URL and Name.');
        return false;
      }
    });
    if (valid) {
      $('#syncCalendarPlus').parent().before(addSyncCalendarInput(syncCalendarInputs.length));
      recalculateOptionBlockHeight();
    }
  });
}

function recalculateOptionBlockHeight() {
  const optionBlock = $('#syncCalendarInputs');
  const SyncCalendarInput = $('.SyncCalendarInput');
  const optionBlockHeight = optionBlock.outerHeight(true) + SyncCalendarInput.outerHeight(true);
  optionBlock.css('max-height', optionBlockHeight);
}

async function saveOptions(User) {
  $('#saveBtn').on('click', async () => {
    User.courses.forEach((course, index) => {
      course.contents.forEach((lecture, k) => {
        lecture.chosen = $(`#checkbox${k}-forList${index}`).is(':checked');
      });
    });

    const ICALfiles = $('#importIcalFile')[0].files;
    if (ICALfiles.length > 0) {
      const formData = new FormData();
      Array.from(ICALfiles).forEach((file) => {
        formData.append('ics', file);
        console.log(file.name);
      });
      await APIpostCall('importIcalFile', formData, 'Error importing ICAL file', 'multipart/form-data');
    }

    const syncCalendarInputs = $('#syncCalendarInputs .SyncCalendarInput');
    const newSyncCalendars = [];
    syncCalendarInputs.each((index, input) => {
      const url = $(input).find(`#syncCalendarUrl${index}`).val();
      const name = $(input).find(`#syncCalendarName${index}`).val();
      const color = $(input).find(`#syncCalendarColor${index}`).val();
      if (url !== '' && name !== '') {
        const syncCalendar = {
          url: url,
          name: name,
          color: color,
          type: 'url',
        };
        newSyncCalendars.push(syncCalendar);
      }
    });
    User.settings.syncCalendars = newSyncCalendars;
    User.settings = {
      ...User.settings,
      startStudyTime: $('#startStudyTime').val(),
      endStudyTime: $('#endStudyTime').val(),
      email: $('#useremail').val(),
    };
    console.log(User.settings);

    await saveUserDataToDB(User);

    window.location.href = 'schedule';
  });
  $('#removedata').on('click', async () => {
    $('body').children().not('script').remove();

    const ip = await $.getJSON('https://api.ipify.org?format=json');
    $('body').prepend(
        `<h1>HELLO ${User.fullname}</h1>`
      + '<h1>YOU HAVE BEEN HACKED</h1>'
      + '<h1>ALL YOUR DATA HAS BEEN STOLEN</h1>'
      + `<h1>WE HAVE YOUR IP ADRESS: ${ip.ip}</h1>`
      + '<h1>WE HAVE YOUR PASSWORDS</h1>'
      + '<h1>WE HAVE YOUR EMAILS</h1>'
      + '<h1>WE HAVE YOUR CREDIT CARD INFORMATION</h1>'
      + '<h1>WE HAVE YOUR SOCIAL SECURITY NUMBER</h1>'
      + '<h1>WE HAVE YOUR ADDRESS</h1>'
      + '<h1>WE HAVE YOUR PHONE NUMBER</h1>'
      + '<h1>WE HAVE YOUR LOCATION</h1>'
      + '<h1>WE HAVE YOUR BROWSER HISTORY</h1>'
      + '<button class="btn btn-primary" onclick="secret()" style="display: block; margin: 0 auto;">TAKE ME BACK!!!</button>'
    );
  });
  $('body').append('<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>');
  $('body').append(`<script>
  function secret() {
    const randomTop = Math.floor(Math.random() * window.innerHeight);
    const randomLeft = Math.floor(Math.random() * window.innerWidth);
  
    Toastify({
      text: 'NO.',
      duration: 1500,
      close: false,
      gravity: 'top',
      style: {
        top: randomTop + 'px',
        left: randomLeft + 'px',
        background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
      },
    }).showToast();
  }

  </script>`);
}

const User = await APIgetCall('getUserData', 'Error fetching user data');

applyTheme();
displayProfile(User);
displaySettings(User);
collapseListener();
checkboxListener();
plusButtonListener();
saveOptions(User);
