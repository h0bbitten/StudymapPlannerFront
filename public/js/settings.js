import {applyTheme, setCookie, getCookie, LoadingScreen, displayProfile, settingsBtn} from './script.js';
let userid = sessionStorage.getItem("userid");
let index = 0;

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
    $('#form0').append(`
         <div class="collapsible-container">
            <button type="button" class="collapsible">${course.fullnamedisplay}</button>
            <div class="lecturelist" id="course${index}">
                        
                    </div>
                </div>
        `);

    course.contents.forEach((lecture, k) => {
        $(`#course${index}`).append(`
            <div class="checkbox checkbox-container">
                <label class="checkbox-label" for="checkbox${k}">
                    <input type="checkbox" id="checkbox${k}" name="type" value="${k}" checked/>
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
