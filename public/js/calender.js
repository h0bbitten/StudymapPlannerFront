let nav = 0;
const calendar = document.getElementById('calendar');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function load() {
  const dt = new Date(); // Datoen i dag

  if (nav !== 0) { // Hvis nav ikke er 0, så tilføj eller træk fra måneden. Nav er en global variabel som bruges til at holde styr på hvilken måned der vises.
    dt.setMonth(new Date().getMonth() + nav); // Sætter måneden til den nuværende måned + nav
  }

  const month = dt.getMonth(); // Måneden i dag
  const year = dt.getFullYear(); // Året i dag

  const firstDayOfMonth = new Date(year, month, 1); // Første dag i måneden. I parantesen er det år, måned og dag.
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Antal dage i måneden. I parantesen er det år, måned og dag.

  const dateString = firstDayOfMonth.toLocaleDateString('da-dk', { // Datoen i dag som en string
    weekday: 'long', // Dagen på ugen
    year: 'numeric', // Året
    month: 'numeric', // Måneden
    day: 'numeric', // Dagen
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]); // Finder ud af hvor mange dage der skal være før den første dag i måneden. Det gør den ved at finde indexet af dagen i ugen i weekdays arrayet.

  document.getElementById('monthDisplay').innerText = // Skriver måneden og året i h1 tagget
    `${dt.toLocaleDateString('da-dk', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';


  const storedLectureNames = localStorage.getItem('lectureNames'); // Henter lectureNames fra local storage som er gemt i schedule.js
  let lectures = storedLectureNames ? JSON.parse(storedLectureNames) : [];

  let lectureIndex = 0;

  for(let i = 1; i <= paddingDays + daysInMonth; i++) { // Laver en for loop som kører fra 1 til antal dage i måneden + paddingDays. PaddingDays er de dage der skal være før den første dag i måneden.
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    if (i > paddingDays) { // Hvis i er større end paddingDays, så er det en dag i måneden
      const dayNumber = i - paddingDays; // Finder ud af hvilken dag i måneden det er
      daySquare.innerText = dayNumber; // Skriver dagen i firkanten

      if (month === 2 && lectureIndex < lectures.length) { // Lige nu er der hardcoded til at vise lectures i marts siden der ikke kan hentes rigtige datoer fra moodle. Tænker vi stadig kan bruge den her metode til algoritmen.
        const eventPara = document.createElement('p');
        eventPara.classList.add('event');
        eventPara.textContent = lectures[lectureIndex++];
        daySquare.appendChild(eventPara);
      }
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);    
  }
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

}

function showWeek(){
  
}

initButtons();
load();