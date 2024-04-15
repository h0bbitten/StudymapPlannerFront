import {
  applyTheme, LoadingScreen, displayProfile, saveUserDataToDB, APIgetCall,
} from './script.js';

async function displaySettings(User) {
  LoadingScreen.add();
  LoadingScreen.show();
  displayCourses(User.courses);
  displayStudyTime(User.settings);
  displayAccountSettings(User.userid, User.settings);
  $('input[type="checkbox"]').each(subCheckboxChange);
  LoadingScreen.hide();
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
    $(`#${course.id} .collapsible`).prepend(`<input type="checkbox" id="checkboxTitle${index}" value=${index} class="checkboxTitle">`);
    $(`#${course.id} .checkbox-label`).append(`<div class="lecturelist" id="course${index}"></div>`);

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
  $('#formSetting').append(createCollapsible('Study Time', 'studyTime'));
  $('#studyTime .checkbox-label').append(`
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
  $('#formSetting').append(createCollapsible('Account', 'accountSettings'));
  $('#accountSettings .checkbox-label').append(`
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

async function saveOptions(User) {
  $('#saveBtn').on('click', async () => {
    User.settings = {
      startStudyTime: $('#startStudyTime').val(),
      endStudyTime: $('#endStudyTime').val(),
      email: $('#useremail').val(),
    };

    User.courses.forEach((course, index) => {
      course.contents.forEach((lecture, k) => {
        lecture.chosen = $(`#checkbox${k}-forList${index}`).is(':checked');
      });
    });

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
saveOptions(User);
