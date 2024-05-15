import {
  applyTheme, LoadingScreen, displayProfile, saveUserDataToDB, APIgetCall, APIpostCall, infoBoxListener,
} from './script.js';

async function displaySettings(User) {
  LoadingScreen.add();
  LoadingScreen.show();
  displayScheduleOptions(User.settings, User.schedule.algorithm, User.schedule.preferEarly, User.schedule.wantPrep);
  displayCourses(User.courses);
  displaySyncCalendar(User.userid, User.settings);
  displayImportExport(User.userid, User.settings);
  displayAccountSettings();
  $('input[type="checkbox"]').each(subCheckboxChange);
  $('.optionBlock').prepend('<div class="optionBlockPadding"></div>');
  $('.optionBlock').append('<div class="optionBlockPadding"></div>');
  displayError();
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
    $(`#${course.id} .collapsible`).prepend(`<input type="checkbox" id="checkboxTitle${index}" value=${index} class="checkboxTitle">`);
    $(`#${course.id}`).append(`<div class="optionBlock lecturelist" id="course${index}"></div>`);
    $(`#course${index}`).append(`<div class="CourseOptions" id="CourseOptions${index}"></div>`);
    addCourseOptions(index, course);
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

function addCourseOptions(index, course) {
  $(`#CourseOptions${index}`).append(`
    <label class="optionInput" for="date${index}">
      <span>Exam Date:</span>              
      <input type="date" id="date${index}" value="${course.examDate}"/>
    </label>
    <label class="optionInput" for="color${index}">
      <span>Color:</span>              
      <input type="color" id="color${index}" value="${course.color}"/>
    </label>
  `);
}

function displayScheduleOptions(settings, algorithm, preferEarly, wantPrep) {
  $('#formSettings').append(createCollapsible('Schedule', 'scheduleOptions'));
  $('#scheduleOptions').append(`
    <div class="optionBlock">
      <label class="optionInput" for="startStudyTime">
        <input type="time" id="startStudyTime" name="startStudyTime" value="${settings.startStudyTime}"/>
        <span>Start study time</span>              
      </label>
      <label class="optionInput" for="endStudyTime">
        <input type="time" id="endStudyTime" name="endStudyTime" value="${settings.endStudyTime}"/>
        <span>End study time</span>              
      </label>
      <div class="optionInput">
        <label for="algorithm">Change Scheduling strategy:</label>
        <select name="algorithm" id="algorithm">
          <option value="emptyFirstComeFirstServe">First Come First Serve</option>
          <option value="fiveDayStudyPlan">5 Day Study Plan</option>
          <option value="addaptiveGapWithMixing">Fill From The End (mixing allowed)</option>
          <option value="addaptiveGapNoMixing">Fill From The End (no mixing)</option>
        </select>
        <div class="tooltip">
          <span id="algoInfo">?</span>
          <span class="tooltiptext">Scheduling strategy info</span>
        </div>
      </div>
      <div class="optionInput">
        <label for="preferEarly">Schedule lectures as early as possible in the day; else as late as possible:</label>
        <input type="checkbox" id="preferEarly" name="preferEarly"/>
      </div>
      <div class="optionInput">
        <label for="wantPrep">Have a preparation day for each exam, as close to the exam as possible:</label>
        <input type="checkbox" id="wantPrep" name="wantPrep"/>
      </div>  
    </div>
  `);
  $('#algorithm').val(algorithm);
  $('#preferEarly').prop('checked', preferEarly);
  $('#wantPrep').prop('checked', wantPrep);
}

function displayAccountSettings() {
  $('#formSettings').append(createCollapsible('Account', 'accountSettings'));
  $('#accountSettings').append(`
    <div class="optionBlock" id="accountSettingsInputs">
      <label class="optionInput" for="logout&removeData">
        <a id="logout" class="btn btn-primary" href="/logout">Logout</a>
        <button id="removedata" class="btn btn-primary">Delete all stored data</button>                            
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
      <div class="optionInput" id="importedIcalFiles">
      </div>
      <label class="optionInput" id="exportIcalFile">
        <a id="exportIcalFile" class="btn btn-primary" href="/exportIcalFile">Export Calendar</a>                            
      </label>
    </div>
  `);
  if (settings.importedCalendars.length > 0) {
    $('#importedIcalFiles').append('<span>Imported Calendars</span>');
    displayImportedCalendars(settings.importedCalendars);
  }
}

function displayImportedCalendars(calendars) {
  calendars.forEach((calendar, index) => {
    $('#importedIcalFiles').append(`
      <div class="importedIcalFile">
        <span>${calendar.name}</span>
        <button type="button" class="btn btn-primary removeIcalFileBtn" id="removeIcalFile${index}">Remove</button>
      </div>
    `);
  });
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

function displayError() {
  const url = window.location.href;
  const error = url.split('?error=')[1];
  if (error) console.error(error);
  if (error === 'notEnoughtTimeToStudyForLectures') {
    // eslint-disable-next-line no-undef
    Toastify({
      text: 'Not enough time to study for all lectures. Please either allocate more study-time, change schedule strategy or select fewer lectures.',
      close: true,
      duration: -1,
      gravity: 'top',
      position: 'center',
      style: {
        background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
      },
    }).showToast();
  }
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
    // eslint-disable-next-line consistent-return
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

function removeButtonListener(importedCalendars) {
  const removeIcalFileBtn = $('.removeIcalFileBtn');
  removeIcalFileBtn.on('click', function listener() {
    const Filename = $(this).parent().find('span').text();
    console.log('Removing iCal file:', Filename);
    const removeFile = {
      name: Filename,
      type: 'remove',
    };
    const index = importedCalendars.findIndex((file) => file.name === Filename);
    if (index !== -1) {
      importedCalendars[index] = removeFile;
    }
    $(this).parent().remove();
    if (allFilesRemoved(importedCalendars)) {
      $('#importedIcalFiles').empty();
    }
  });
}

function allFilesRemoved(importedCalendars) {
  return importedCalendars.every((file) => file.type === 'remove');
}

async function saveOptions(User) {
  $('#saveBtn').on('click', async () => {
    User.courses.forEach((course, index) => {
      course.chosen = $(`#checkboxTitle${index}`).is(':checked');
      course.color = $(`#color${index}`).val();
      const newExamDate = $(`#date${index}`).val();
      if (newExamDate !== course.examDate) User.schedule.outDated = true;
      course.examDate = newExamDate;
      course.contents.forEach((lecture, k) => {
        lecture.chosen = $(`#checkbox${k}-forList${index}`).is(':checked');
      });
    });

    const newImportedCalendars = [];
    const ICALfiles = $('#importIcalFile')[0].files;
    if (ICALfiles.length > 0) {
      const formData = new FormData();
      Array.from(ICALfiles).forEach((file) => {
        formData.append('ics', file);
        const importCal = {
          name: file.name,
          color: '#385280',
          type: 'file',
        };
        newImportedCalendars.push(importCal);
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
    User.settings.importedCalendars = mergeArrays(User.settings.importedCalendars, newImportedCalendars);

    const Scheduleinputs = {
      startStudyTime: $('#startStudyTime').val(),
      endStudyTime: $('#endStudyTime').val(),
      algorithm: $('#algorithm').val(),
      preferEarly: $('#preferEarly').is(':checked'),
      wantPrep: $('#wantPrep').is(':checked'),
    };
    if (
      Object.keys(Scheduleinputs).some((key) => Scheduleinputs[key] !== User.schedule[key] && Scheduleinputs[key] !== User.settings[key])
    ) User.schedule.outDated = true;

    User.settings = {
      ...User.settings,
      startStudyTime: Scheduleinputs.startStudyTime,
      endStudyTime: Scheduleinputs.endStudyTime,
    };
    User.schedule.algorithm = Scheduleinputs.algorithm;
    User.schedule.preferEarly = Scheduleinputs.preferEarly;
    User.schedule.wantPrep = Scheduleinputs.wantPrep;

    console.log(User.settings);

    await saveUserDataToDB(User);

    window.location.href = 'schedule';
  });
}

function mergeArrays(oldArray, newArray) {
  const oldMap = new Map(oldArray.map((obj) => [obj.name, obj]));

  for (const newObj of newArray) {
    if (oldMap.has(newObj.name)) {
      const oldObj = oldMap.get(newObj.name);
      Object.assign(oldObj, newObj);
    } else {
      oldArray.push(newObj);
    }
  }

  return oldArray;
}

function deleteBtnListener() {
  $('#removedata').on('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/deleteAllUserData', {
        method: 'DELETE',
        cache: 'no-cache',
      });
      if (!response.ok) {
        toastifyError('Error deleting user data');
        throw new Error('Network response error');
      }
      window.location.href = '/logout';
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
}

const User = await APIgetCall('getUserData', 'Error fetching user data');
console.log(User);

applyTheme();
displayProfile(User);
displaySettings(User);
collapseListener();
checkboxListener();
plusButtonListener();
removeButtonListener(User.settings.importedCalendars);
infoBoxListener();
deleteBtnListener();
saveOptions(User);
