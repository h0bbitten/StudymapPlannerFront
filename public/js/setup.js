/*indsætter tekst til checkbox */
let kursusNavn="Hej!";
var myArray = [];

/*Kryds af*/
document.getElementById("checkbox1").textContent= "Option 4";
document.getElementById("checkbox2").textContent= "Option 2";
document.getElementById("checkbox3").textContent= "Option 1";

/* Modtag svar fra checkbox*/
var form=document.getElementById('input-form')

document.getElementById('nextPage').addEventListener('click', function(e) {
    var myArray = [];
    location.href="setup2.html"

    form.querySelectorAll('input').forEach(function (input) {
      if(input.type === 'checkbox' && input.checked) {
        myArray.push(input.value);
      }
    })
      console.log(myArray)
  })


