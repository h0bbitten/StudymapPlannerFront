import {
  applyTheme, LoadingScreen, displayProfile, Button, APIgetCall, saveUserDataToDB,
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
    showCourses(User);

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
  for (let i = 1; i <= amountOfCourses; i++) {
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
  console.log(`index is ${index}`);
}

function goToNextPage() {
  if (index > 0) {
    index++;
    console.log(`index is ${index}`);
    $(`#form${index - 1}`).hide();
    $(`#form${index}`).show();
    const examDate = $(`#datepicker${index - 2}`).val();
    if (examDate === '') {
      // eslint-disable-next-line no-undef
      // Displays error message if no exam date is selected
      Toastify({
        text: 'Please select an exam date for each course.',
        duration: 1500,
        close: false,
        gravity: 'top',
        position: 'center',
        style: {
          background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
        },
      }).showToast();
      return;
    }
    if (index === amountOfCourses + 2) {
      next.hideButton();
      save.showButton();
      return;
    }
  }
  if (index === 0) {
    checkboxes = $('input[type=checkbox]');
    amountOfCourses = $('input[type=checkbox]:checked').length;
    if (amountOfCourses === 0) {
      // eslint-disable-next-line no-undef
      // Displays error message if no courses are selected
      Toastify({
        text: 'Please select atleast one course.',
        duration: 1500,
        close: false,
        gravity: 'top',
        position: 'center',
        style: {
          background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
        },
      }).showToast();
      return;
    }
    index++;
    console.log(`index is ${index}`);
    let index2 = 0;
    checkboxes.each((i, checkbox) => {
      if (checkbox.checked) {
        index2++;
        // Appends a form for each course
        $('#forms').append(`
              <div id="form${index2}div" class="forms">
              <form id="form${index2}" style="display: none;">
              <h3 id="${User.courses[i].id}">${User.courses[i].fullnamedisplay}</h3>

             
              </form>
              </div>
          `);
           // Appends a datepicker to each course form  
          $(`#form${index2}`).append(`
            <div class="datepicker-container">
              <label for="datepicker${i}">Exam date:</label>
              <input type="date" id="datepicker${i}" class="datepicker" name="datepicker" required>
            </div>
            `);

            // Save the chosen exam date for each course
            $(`#datepicker${i}`).change(function() {
            const examDate = $(this).val();
            User.courses[i].examDate = examDate;
            });

          // Initialize datepicker
          
       
          // Appends a checkbox for each lecture
        User.courses[i].contents.forEach((lecture, j) => {
          $(`#form${index2}`).append(`
            <div class="checkbox lecture-container">
              <label class="lectureLabel" for="lecture${j}">
                <input type="checkbox" id="lecture${j}" name="type" value="${j}" checked>
                <span id="lecture${j}Text">${lecture.name}</span>
              </label>
            </div>
          `);

          
          
        });
      }
    });
    // Shows the first course form and hides the course selection form
    $('#form0').hide();
    $('#form1').show();
    $('#header').text('Which lectures do you want to study for the exam?');
    previous.showButton();
  
  }

  console.log(amountOfCourses);

  // Shows study time form if index is equal to amount of courses + 1
  if (index === amountOfCourses + 1) {
    $('#forms').append(`
            <div id="form${index + 1}div" class="forms">
                <form id="form${index + 1}" style="display: none;">
                    <h2>Choose Study Time</h2>
                   
                    <input type="time" class="studyTime" id="startStudyTime" name="appt" min="01:00" max="00:00" value="08:00" required/>
                    
                    <input type="time" class="studyTime" id="endStudyTime" name="appt" min="01:00" max="00:00" value="16:00" required/>
        `);
    $(`#form${index}`).hide();
    $(`#form${index + 1}`).show();
    next.hideButton();
    save.showButton();
  }
}

async function saveOptions() {
  console.log('Saving options');
  console.log(User);
  let index = 0;
  const startStudyTime = $('#startStudyTime').val();
  const endStudyTime = $('#endStudyTime').val();

  if (startStudyTime === endStudyTime || startStudyTime > endStudyTime) {
    // eslint-disable-next-line no-undef
    Toastify({
      text: 'Invalid.',
      duration: 1500,
      close: false,
      gravity: 'top',
      position: 'center',
      style: {
        background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
      },
    }).showToast();
    return;
  }
  checkboxes.each((i, checkbox) => {
    User.courses[i].chosen = checkbox.checked;
    if (User.courses[i].chosen === false) {
      User.courses[i].contents.forEach((lecture) => {
        lecture.chosen = false;
      });
    } else {
      index++;
      $(`#form${index} input[type=checkbox]`).each((j, subcheckbox) => {
        console.log('i is', i, 'j is', j);
        User.courses[i].contents[j].chosen = subcheckbox.checked;
      });
    }
  });

  // Gemmer start / end study time.
  User.settings = {};
  User.settings.startStudyTime = startStudyTime;
  User.settings.endStudyTime = endStudyTime;
  console.log(User.startStudyTime, User.endStudyTime);

  User.settings.setupDone = true;

  await saveUserDataToDB(User);

  window.location.href = 'schedule';
}

function showCourses(User) {
  if (User.courses.length === 0) {
    $('#header').text('You are not enrolled in any courses.');
  } else {
    User.courses.forEach((course, index) => {
      $('#form0').append(`
            <div class="form0">
            <label class="checkbox-label" for="checkbox${index}">
               <input type="checkbox" id="checkbox${index}" name="type" value="${index}" checked/>
                 <span id="checkbox${index}Text">${course.fullnamedisplay}</span>              
             </label>
          </div>`);
    });
  }
}
applyTheme();
setupInitialization();
$(document).on('click', '#goToNextPage', goToNextPage);
$(document).on('click', '#goToPreviousPage', goToPreviousPage);
$(document).on('click', '#save', saveOptions);
