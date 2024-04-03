/* setup 1*/

/*indsætter tekst til checkbox */
let kursusNavn="Hej!";
var myArray = [];
let index = 1;

/*Kryds af*/
document.getElementById("checkbox1Text").textContent = "Option 4";
document.getElementById("checkbox2Text").textContent = kursusNavn;
document.getElementById("checkbox3Text").textContent = "Option 1";

/* Modtag svar fra checkbox*/
//var form = document.getElementById('input-form');
let lectures = [];

document.getElementById('goToNextPage').addEventListener('click', function() {
    console.log("test");
        form.querySelectorAll('input').forEach(function(input) {
            if (input.type === 'checkbox' && input.checked) {
                myArray.push(input.value);
                console.log(myArray);
                
                // Save array data
                localStorage.setItem('myArrayData', JSON.stringify(myArray));
            }
        });
    }); 

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
    $('#form1').show();
    $('#form2').hide();
    $('#form3').hide();
});


function goToPreviousPage() {
        $(`#form${index}`).hide();
        $(`#form${index - 1}`).show();
        index--;
        console.log(index);
    }

function goToNextPage() {
    $(`#form${index}`).hide();
    $(`#form${index + 1}`).show();
    index++;
    console.log(index);
    if (index == 4){
    location.href = "schedule.html";
    }
    }