import {
  applyTheme, LoadingScreen, displayProfile, Button, APIgetCall, saveUserDataToDB, callToastify, infoBoxListener,
} from './script.js';

let index = 0;
let User = {};
let amountOfCourses = 1;
let checkboxes = null;

const previous = new Button('goToPreviousPage', 'Previous');
const next = new Button('goToNextPage', 'Next');
const save = new Button('save', 'Save');

async function setupInitialization() {
  LoadingScreen.add();
  LoadingScreen.show();

  try {
    User = await APIgetCall('getMoodleInfo', 'Error retrieving Moodle info');
    console.log(User);

    displayProfile(User);
    showCourses(User.courses);

    previous.addButton();
    next.addButton();
    save.addButton();
    next.showButton();
    LoadingScreen.hide();
  } catch (error) {
    LoadingScreen.hide();

    console.error('Failed to show enrolled courses options:', error);
  }
}

function resetForm() {
  for (let i = 1; i <= amountOfCourses + 2; i++) {
    $(`#form${i}div`).remove();
  }

  index = 0;
  amountOfCourses = 1;
  checkboxes = null;
}

function goToPreviousPage() {
  if (index > 0) {
    index--;
    $(`#form${index + 1}`).hide();
    $(`#form${index}`).show();
  }

  if (index === amountOfCourses + 1 || index === amountOfCourses) {
    save.hideButton();
    next.showButton();
    $(`#form${index + 2}`).hide();
    $(`#form${index}`).show();
  }
  if (index === 0) {
    $('#header').text('Which courses do you want to study for the exam?');
    previous.hideButton();
    resetForm();
  }
  if (index === amountOfCourses + 1) {
    $('#header').text('Choose Study Time');
  }
  if (index > amountOfCourses + 1 && index !== 0) {
    $('#header').text('Which lectures do you want to study for the exam?');
  }
}

function goToNextPage() {
  if (index > 0) {
    const examDate = $(`#datepicker${index - 1}`).val();
    if (examDate === '') {
      // Displays error message if no exam date is selected
      callToastify('Please select an exam date for each course.');
      return;
    }
    const currentDate = new Date();
    const selectedDate = new Date(examDate);

    if (selectedDate < currentDate) {
      callToastify('Please select a future exam date.');
      return;
    }
    index++;
    console.log(`index is ${index}`);
    $(`#form${index - 1}`).hide();
    $(`#form${index}`).show();
    if (index === amountOfCourses + 2) {
      next.hideButton();
      save.showButton();
    }
  }

  if (index === 0) {
    checkboxes = $('input[type=checkbox]');
    amountOfCourses = $('input[type=checkbox]:checked').length;
    if (amountOfCourses === 0) {
      callToastify('Please select at least one course.');
      return;
    }
    index++;
    console.log(`index is ${index}`);
    let formIndex = 1;
    checkboxes.each((i, checkbox) => {
      createCourseForm(checkbox, i, formIndex);
      if (checkbox.checked) {
        formIndex++;
      }
    });

    // Show study time form
    $('#header').text('Choose Study Time');
    $('#forms').append(`
      <div id="form${amountOfCourses + 1}div" class="forms">
        <form id="form${amountOfCourses + 1}" style="display: none;">                   
            <input type="time" class="studyTime" id="startStudyTime" name="appt" min="01:00" max="00:00" value="08:00" required/>
            <input type="time" class="studyTime" id="endStudyTime" name="appt" min="01:00" max="00:00" value="16:00" required/>
        </form>
      </div>        
    `);

    // Show scheduling strategy form
    $('#forms').append(`
    <div id="form${amountOfCourses + 2}div">
      <form id="form${amountOfCourses + 2}" style="display: none;">
        <label for="algorithm">Select scheduling strategy:</label>
        <select name="algorithm" id="algorithm">
          <option value="emptyFirstComeFirstServe">First Come First Serve</option>
          <option value="fiveDayStudyPlan">5 Day Study Plan</option>
          <option value="addaptiveGapWithMixing">Fill From The End (mixing allowed)</option>
          <option value="addaptiveGapNoMixing">Fill From The End (no mixing)</option>
        </select>
        <div class="tooltip">
          <span id="algoInfo">?</span>
          <span class="tooltiptext">Strategy info</span>
        </div>
        <div class="optionInput">
          <label for="preferEarly">Schedule lectures as early as possible in the day; else as late as possible:</label>
          <input type="checkbox" id="preferEarly" name="preferEarly" checked/>
        </div>
        <div class="optionInput">
          <label for="wantPrep">Have a preparation day for each exam, as close the exam as possible:</label>
          <input type="checkbox" id="wantPrep" name="wantPrep" checked/>
        </div>  
      </form>
    </div>
    `);

    // Shows the first course form and hides the course selection form
    $('#form0').hide();
    $('#form1').show();
    $('#header').text('Which lectures do you want to study for the exam?');
    previous.showButton();
  }

  if (index === amountOfCourses + 1) {
    $('#header').text('Choose Study Time');
  }

  if (index === amountOfCourses + 2) {
    $('#header').text('Select scheduling strategy');
  }
}

function createCourseForm(checkbox, i, formIndex) {
  if (checkbox.checked) {
    console.log(`index2 is ${formIndex}`);
    // Appends a form for each course
    $('#forms').append(`
        <div id="form${formIndex}div" class="forms">
          <form id="form${formIndex}" style="display: none;">
            <h3 id="${User.courses[i].id}">${User.courses[i].fullnamedisplay}</h3>
          </form>
        </div>
      `);
    // Appends a datepicker to each course form
    $(`#form${formIndex}`).append(`
        <div class="datepicker-container">
          <label for="datepicker${i}">Exam date:</label>
          <input type="date" id="datepicker${i}" class="datepicker" name="datepicker" required>
        </div>
      `);

    // Save the chosen exam date for each course
    $(`#datepicker${i}`).change(function assignDate() {
      const examDate = $(this).val();
      User.courses[i].examDate = examDate;
    });
    // Initialize datepicker
    // Appends a checkbox for each lecture
    User.courses[i].contents.forEach((lecture, j) => {
      $(`#form${formIndex}`).append(`
        <div class="checkbox lecture-container">
          <label class="lectureLabel" for="lecture${j}">
            <input type="checkbox" id="lecture${j}" name="type" value="${j}" checked>
            <span id="lecture${j}Text">${lecture.name}</span>
          </label>
        </div>
      `);
    });
  }
}

async function saveOptions() {
  console.log('Saving options');
  console.log(User);
  const startStudyTime = $('#startStudyTime').val();
  const endStudyTime = $('#endStudyTime').val();

  if (startStudyTime === endStudyTime || startStudyTime > endStudyTime) {
    callToastify('Invalid study time. Please select a valid study time.');
    return;
  }
  let checkboxIndex = 0;
  checkboxes.each((i, checkbox) => {
    User.courses[i].chosen = checkbox.checked;
    if (User.courses[i].chosen === false) {
      User.courses[i].contents.forEach((lecture) => {
        lecture.chosen = false;
      });
    } else {
      checkboxIndex++;
      $(`#form${checkboxIndex} input[type=checkbox]`).each((j, subcheckbox) => {
        console.log('i is', i, 'j is', j);
        User.courses[i].contents[j].chosen = subcheckbox.checked;
      });
    }
  });

  // Gemmer start / end study time.
  User.settings = {};
  User.settings.startStudyTime = startStudyTime;
  User.settings.endStudyTime = endStudyTime;
  User.settings.syncCalendars = [];
  User.settings.importedCalendars = [];

  User.schedule = {};
  User.schedule.outDated = true;
  User.schedule.algorithm = $('#algorithm').val();
  User.schedule.preferEarly = $('#preferEarly').is(':checked');
  User.schedule.wantPrep = $('#wantPrep').is(':checked');

  User.settings.setupDone = true;

  await saveUserDataToDB(User);
  console.log('User saved to DB:', User);

  window.location.href = 'schedule';
}

function showCourses(Courses) {
  if (Courses.length === 0) {
    $('#header').text('You are not enrolled in any courses.');
  } else {
    Courses.forEach((course, i) => {
      $('#form0').append(`
          <div class="form0">
            <label class="checkbox-label" for="checkbox${i}">
              <input type="checkbox" id="checkbox${i}" name="type" value="${i}" checked/>
              <span id="checkbox${i}Text">${course.fullnamedisplay}</span>              
            </label>
          </div>`);
    });
  }
}

applyTheme();
setupInitialization();
$(document).ready(() => {
  infoBoxListener();
  $(document).on('click', '#goToNextPage', goToNextPage);
  $(document).on('click', '#goToPreviousPage', goToPreviousPage);
  $(document).on('click', '#save', saveOptions);
});
