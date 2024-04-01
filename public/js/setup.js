/* setup 1*/

/*indsætter tekst til checkbox */
let kursusNavn="Hej!";
var myArray = [];

/*Kryds af*/
document.getElementById("checkbox1Text").textContent = "Option 4";
document.getElementById("checkbox2Text").textContent = kursusNavn;
document.getElementById("checkbox3Text").textContent = "Option 1";

/* Modtag svar fra checkbox*/
var form = document.getElementById('input-form');

document.getElementById('faerdig').addEventListener('click', function(e) {
    

    form.querySelectorAll('input').forEach(function(input) {
        if (input.type === 'checkbox' && input.checked) {
            myArray.push(input.value);
        }
    });

    // Store the array data in local storage
    localStorage.setItem('myArray', JSON.stringify(myArray));
    location.href = "setup2.html?myArray=" + JSON.stringify(myArray);
    
}); 

document.getElementById('lectureHeadline').textContent = "Hello";

//if (myArray.length > 0) {
//    for(let i = 0; i < myArray.length; i++) {
//        location.href = "setup2.html?myArray=" + JSON.stringify(myArray);
//    }
//} else {
//    location.href = "schedule.html";
//}

// setup 2 
// setup 2
var lectures = [];

// Save each checked lecture
document.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
    if (input.checked) {
        lectures.push(input.value);
    }
});

// Store the lectures array in local storage
localStorage.setItem('lectures', JSON.stringify(lectures));

// Redirect to the next page
location.href = "nextPage.html";