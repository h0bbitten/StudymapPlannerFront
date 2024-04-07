import {applyTheme, LoadingScreen, displayProfile} from './script.js';

let token = sessionStorage.getItem("token");
let index = 0;
let User = {};
let amountOfCourses = 1;
let checkboxes = null;

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

let previous = new Button('goToPreviousPage', 'Previous');
let next = new Button('goToNextPage', 'Next');
let save = new Button('save', 'Save');

async function getMoodleInfo(token){
  try {
    const response = await fetch(`http://localhost:3000/getMoodleInfo?token=${token}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  } 
  catch (error) {
    console.error('Error fetching course pages:', error);
    throw error;
  }

}


async function setupInitialization() {

    let Loading = new LoadingScreen();
    Loading.add();
    Loading.show();

    try {
        User = await getMoodleInfo(token);
        console.log(User);
        sessionStorage.setItem("userid", User.userid);
        displayProfile(User);
        showCourses(User);


        previous.addButton();
        next.addButton();
        save.addButton();
        next.showButton();
        Loading.hide();

    }
    catch (error) {

        Loading.hide();

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
    console.log(`index is ${index}`);
    if (index === amountOfCourses + 1) {
        index--;
        save.hideButton();
        next.showButton();
        $(`#form${index + 1}`).hide();
    }
    if (index > 0) {
        index--;
        $(`#form${index + 1}`).hide();
        $(`#form${index}`).show();
    }
    if (index === 0) {
        $('#header').text('Which courses do you want to study for the exam?');
        previous.hideButton();
        resetForm();
    }
}


function goToNextPage() {
    if (index > 0) {
        index++;
        console.log(`index is ${index}`);
        $(`#form${index - 1}`).hide();
        $(`#form${index}`).show();
        if (index === amountOfCourses + 2) {

            next.hideButton();
            save.showButton();
            return;
        }
    }
    if (index === 0){
        checkboxes = $('input[type=checkbox]');
        amountOfCourses = $('input[type=checkbox]:checked').length;
        if (amountOfCourses === 0) {
            Toastify({
                text: "Please select atleast one course.",
                duration: 1500,
                close: false,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                }
            }).showToast();
                return;
        }
        index++;
        console.log(`index is ${index}`);
        let index2 = 0;
        checkboxes.each((i, checkbox) => {
            if (checkbox.checked) {
                index2++;
                $('#forms').append(`
                    <div id="form${index2}div">
                    <form id="form${index2}" style="display: none;">
                    <h3 id="${User.courses[i].id}">${User.courses[i].fullnamedisplay}</h3>
                    </form>
                    </div>
                `);
                User.courses[i].contents.forEach((lecture, j) => {
                    $(`#form${index2}`).append(`
                    <div class="checkbox lecture-container">
                        <label class="lectureLabel" for="lecture${j}">
                            <input type="checkbox" id="lecture${j}" name="type" value="${j}" checked>
                            <span id="lecture${j}Text">${lecture.name}</span>
                        </label>
                    </div>
                    `);
                })
            }
        });    
        $('#form0').hide();
        $('#form1').show();
        $('#header').text('Which lectures do you want to study for the exam?');
        previous.showButton();
    }
    
    console.log(amountOfCourses);
    if (index === amountOfCourses + 1) {
        $('#forms').append(`
            <div id="form${index + 1}div">
                <form id="form${index + 1}" style="display: none;">
                    <h2>Choose Study Time</h2>
                        <div class="form-group">
                        <label for="startStudyTime">Select Starting Study Time: </label>
                        <select class="form-control" id="startStudyTime" name="startStudyTime">
                            <option value="08:00">08:00</option>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <!-- Add more options as needed -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="endStudyTime">Select Ending Study Time: </label>
                        <select class="form-control" id="endStudyTime" name="endStudyTime">
                            <option value="16:00">16:00</option>
                            <option value="17:00">17:00</option>
                            <option value="18:00">18:00</option>
                            <!-- Add more options as needed -->
                        </select>
                    </div>
                </form>
            </div>
        `);
        $(`#form${index}`).hide();
        $(`#form${index + 1}`).show();
        $('#header').text('Choose Study Time');
        next.hideButton();
        save.showButton();
        return;
    }
}

async function saveOptions() {
    console.log('Saving options');
    console.log(User);
    let index = 0;
    checkboxes.each(( i, checkbox) => {
        checkbox.checked ? User.courses[i].chosen = true : User.courses[i].chosen = false;
        if (User.courses[i].chosen === false) {
            User.courses[i].contents.forEach((lecture) => {
                lecture.chosen = false;
            });
        }
        else {
            index++;
            $(`#form${index} input[type=checkbox]`).each((j, subcheckbox) => {
                console.log('i is', i, 'j is', j);
                subcheckbox.checked ? User.courses[i].contents[j].chosen = true : User.courses[i].contents[j].chosen = false;
            });
        }

    });
    await saveOptionsToDB(User);
    
    window.location.href = "schedule";
}

async function saveOptionsToDB(User) {
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



function showCourses(User) { 

    if (User.courses.length === 0) { 
        $('#header').text('You are not enrolled in any courses.');
    }
    else {
        User.courses.forEach((course, index) => {
            $('#form0').append(`
            <div class="checkbox checkbox-container">
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

