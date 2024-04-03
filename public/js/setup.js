/* setup 1*/

/*indsætter tekst til checkbox */
let kursusNavn="Hej!";
var myArray = [];
let index = 0;

/*Kryds af*/
document.getElementById("checkbox1Text").textContent = "Option 4";
document.getElementById("checkbox2Text").textContent = kursusNavn;
document.getElementById("checkbox3Text").textContent = "Option 1";

/* Modtag svar fra checkbox*/
//var form = document.getElementById('input-form');
let lectures = [];
//let lectures2 = [];
//let lectures3 = [];

// 2nd page code goes here
document.getElementById('lecture1Text').textContent = "Lecture 1";
document.getElementById('lecture2Text').textContent = "Lecture 2";
document.getElementById('lecture3Text').textContent = "Lecture 3";
document.getElementById('lecture4Text').textContent = "Lecture 4";
document.getElementById('lecture5Text').textContent = "Lecture 5";
document.getElementById('lecture6Text').textContent = "Lecture 6";
document.getElementById('lecture7Text').textContent = "Lecture 7";
document.getElementById('lecture8Text').textContent = "Lecture 8";
document.getElementById('lecture9Text').textContent = "Lecture 9";
document.getElementById('lecture10Text').textContent = "Lecture 10";
document.getElementById('lecture11Text').textContent = "Lecture 11";
document.getElementById('lecture12Text').textContent = "Lecture 12";
document.getElementById('lecture13Text').textContent = "Lecture 13";

$(document).ready(function() {
    $('#form0').show();
    $('#form1').hide();
    $('#form2').hide();
    $('#form3').hide();
});


function goToPreviousPage() {
        $(`#form${index}`).hide();
        $(`#form${index - 1}`).show();
        index--;
        if (index === 0) {
            myArray = [];
        }
    }

function goToNextPage(user) {
    let formCourse = document.querySelector('form');
    let formLectures = document.querySelector('form');

    if (index === 0) {
    formCourse.querySelectorAll('input').forEach(function(input) {
        if (input.type === 'checkbox' && input.checked) {
            myArray.push(input.value);
            console.log(myArray);
            
            // Save array data
            localStorage.setItem('myArrayData', JSON.stringify(myArray));
        }
    });}
    else if (index <= myArray.length) {
        formLectures.querySelectorAll('input').forEach(function(input) {
            if (input.type === 'checkbox' && input.checked) {
/*                 lectures.push(input.value);
                console.log(lectures);
                
                // Save array data
                localStorage.setItem('lectureData', JSON.stringify(lectures));
                
 */            
    // user.courses[CourseIndex].checked = 
            }
        });
    }
    
    $(`#form${index}`).hide();
    $(`#form${index + 1}`).show();
    index++;
    console.log(index);
    if (index > myArray.length){
    location.href = "schedule.html";
    }

}