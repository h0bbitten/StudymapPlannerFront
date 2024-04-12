import {applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn, saveOptionsToDB} from './script.js';
let userid = sessionStorage.getItem("userid");
let index = 0;

class Button {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
    addButton() {
        $(".buttons").append(`
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
let markAll = new Button("markAll", "Mark all");
let clearAll = new Button("clearAll", "Clear all");
let save = new Button("save", "Save");


async function getUserData(userid){
        try {
            const response = await fetch(`http://localhost:3000/getUserData?userid=${userid}`);
            if (!response.ok) {
                throw new Error('Network response error');
            }
            return response.json();
        } 
        catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    
    }

let User = await getUserData(userid);
console.log(User);

var coll = document.getElementsByClassName("collapsible");
let i;


User.courses.forEach((course, index) => {
    let k = 0;
    $('#formSetting').append(`
         <div class="collapsible-container">
            <button type="button" class="collapsible">${course.fullnamedisplay}</button>
                <div class="lecturelist" id="course${index}">

            <div class="buttons" ></div>
                </div>
            </div>
            
            `);
            

    course.contents.forEach((lecture, k) => {
        $(`#course${index}`).append(`
            <div class="checkbox checkbox-container">
                <label class="checkbox-label" for="checkbox${k}">
                    <input type="checkbox" id="checkbox${k}" name="type" value="${k}" ${lecture.chosen ? "checked" : ""}/>
                    <span id="checkbox${k}Text">${lecture.name}</span>              
                </label>
            </div>
        `);
    });
    index++;
    
    // Read each course within the data
    console.log(course);
    // Add your code here to process each course
});

markAll.addButton();
clearAll.addButton();
markAll.showButton();
clearAll.showButton();

$(`#formSetting`).append(`
    <div class="collapsible-container">
        <button type="button" class="collapsible">Study Time</button>
        <div class="lecturelist" id="studyTime" style="display: none">
            <div class="checkbox checkbox-container">
                <label class="checkbox-label" for="startStudyTime">
                    <input type="time" id="startStudyTime" name="startStudyTime" value="${User.settings.startStudyTime}"/>
                    <span>Start study time</span>              
                </label>
            </div>
            <div class="checkbox checkbox-container">
                <label class="checkbox-label" for="endStudyTime">
                    <input type="time" id="endStudyTime" name="endStudyTime" value="${User.settings.endStudyTime}"/>
                    <span>End study time</span>              
                </label>
            </div>
            <div class="saveBtn"></div>
    `);


    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
    
    
    async function markAllChecks(){
        let checkboxes = $('.checkbox-container input[type="checkbox"]');
    checkboxes.each((i, checkbox) => {
        checkbox.checked = true;
    });
}

async function clearAllChecks(){
    let checkboxes = $('.checkbox-container input[type="checkbox"]');
    checkboxes.each((i, checkbox) => {
        checkbox.checked = false;
    });
}

async function saveOptions(User){


}

displayProfile(User);
applyTheme();
