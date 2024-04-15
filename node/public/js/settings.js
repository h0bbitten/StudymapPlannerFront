import {
  applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveUserDataToDB, APIgetCall,
} from './script.js';

class Button {
  constructor(id, text) {
    this.id = id;
    this.text = text;
  }

  addButton() {
    $('.buttons').append(`
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
const markAll = new Button('markAll', 'Mark all');
const clearAll = new Button('clearAll', 'Clear all');
const save = new Button('save', 'Save');

async function displaySettings(User) {
  displayCourses(User.courses);
  displayStudyTime(User.settings);

  collapseListener();
  
}

function createCollapsible(name, id) {
  const HTML = `
  <div class="collapsible-container" id="${id}">
    <label class="checkbox-label" for="checkboxtitle">
      <button type="button" class="collapsible">
        ${name}
        <span class="carot-collapsible">
          <svg fill="#000000" width="20px" height="20px" viewBox="0 0 256 256" id="carot">
            <path d="M128,188a11.96187,11.96187,0,0,1-8.48535-3.51465l-80-80a12.0001,12.0001,
              0,0,1,16.9707-16.9707L128,159.0293l71.51465-71.51465a12.0001,12.0001,0,0,1,16.9707,16.9707l-80,
              80A11.96187,11.96187,0,0,1,128,188Z">
            </path>
          </svg>
        </span>
      </button>
    </label>  
  </div>`;
  return HTML;
}

function displayCourses(courses) {
  courses.forEach((course, index) => {
    $('#formSetting').append(createCollapsible(course.fullnamedisplay, course.id));
    $(`#${course.id} .collapsible`).prepend('<input type="checkbox" id="checkboxtitle">');
    $(`#${course.id} .checkbox-label`).append(`<div class="lecturelist" id="course${index}"></div>`);

    course.contents.forEach((lecture, k) => {
      $(`#course${index}`).append(`
            <div class="checkbox checkbox-container">
              <label class="checkbox-label" for="checkbox${k}">
                <input type="checkbox" id="checkbox${k}" name="type" value="${k}" ${lecture.chosen ? 'checked' : ''}/>
                <span id="checkbox${k}Text">${lecture.name}</span>              
              </label>
            </div>
        `);
    });
  });
}

function displayStudyTime(settings) {
  $('#formSetting').append(createCollapsible('Study Time', 'studyTime'));
  $('#studyTime .checkbox-label').append(`
    <div id="studyTimeInputs">
      <label class="timeInput" for="startStudyTime">
        <input type="time" id="startStudyTime" name="startStudyTime" value="${settings.startStudyTime}"/>
        <span>Start study time</span>              
      </label>
      <label class="timeInput" for="endStudyTime">
        <input type="time" id="endStudyTime" name="endStudyTime" value="${settings.endStudyTime}"/>
        <span>End study time</span>              
      </label>
    </div>
  `);
  console.log(settings);
}

function collapseListener() {
  $('.collapsible').on('click', function listener(event) {
    if (!event.target.matches('input[type="checkbox"]')) {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      content.classList.toggle('active');
      const carot = this.querySelector('.carot-collapsible');
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        carot.style.transform = 'rotate(0deg)';
      } else {
        content.style.maxHeight = `${content.scrollHeight}px`;
        carot.style.transform = 'rotate(180deg)';
      }
    }
  });

}
async function markAllChecks() {
  const checkboxes = $('.checkbox-container input[type="checkbox"]');
  checkboxes.each((i, checkbox) => {
    checkbox.checked = true;
  });
}

async function clearAllChecks() {
  const checkboxes = $('.checkbox-container input[type="checkbox"]');
  checkboxes.each((i, checkbox) => {
    checkbox.checked = false;
  });
}

async function saveOptions(User) {

}

const User = await APIgetCall('getUserData', 'Error fetching user data');

applyTheme();
displayProfile(User);
displaySettings(User);
