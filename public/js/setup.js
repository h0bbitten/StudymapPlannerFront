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

document.getElementById('nextPage').addEventListener('click', function(e) {
    

    form.querySelectorAll('input').forEach(function(input) {
        if (input.type === 'checkbox' && input.checked) {
            myArray.push(input.value);
        }
    });

    // Store the array data in local storage
    localStorage.setItem('myArray', JSON.stringify(myArray));
    location.href = "setup2.html";
    console.log(myArray);
});

document.getElementById('lectureHeadline').textContent = "Hvilke emner vil du læse op på i " + myArray[0] + "?";

document.getElementById('lectureHeadline').textContent = "Hvilke emner vil du læse op på i" + myArray[0] + "?";

