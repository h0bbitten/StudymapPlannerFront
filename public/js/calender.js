let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const storedLectureNames = localStorage.getItem('lectureNames'); // Henter lectureNames fra local storage som er gemt i schedule.js
let lectures = storedLectureNames ? JSON.parse(storedLectureNames) : [];

let lectureIndex = 0;

function load() {
  if (view === 'week') {
    loadWeekView();
  } else {
    loadMonthView();
  }
}

function loadMonthView() {
  calendar.classList.remove('week-view');
  const dt = new Date();
  
  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const month = dt.getMonth();
  const year = dt.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-gb', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  let paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  if(paddingDays === -1) {
    paddingDays = 6;
  }

  document.getElementById('monthDisplay').innerText = 
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for(let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
    } else {
      daySquare.classList.add('padding');
    }

    if (i > paddingDays) {
      const dayNumber = i - paddingDays;
      daySquare.innerText = dayNumber;

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

function loadWeekView() {
  calendar.classList.add('week-view');
  const today = new Date();
  today.setDate(today.getDate() + nav);

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)));

  document.getElementById('monthDisplay').innerText = 
    `Week of ${startOfWeek.toLocaleDateString('en-us', { month: 'long', day: 'numeric' })}`;

  calendar.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const dayInterval = document.createElement('div');
    dayInterval.classList.add('day-interval');

    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    let weekDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    daySquare.innerText = weekDay.toLocaleDateString('en-us', { weekday: 'long', month: 'numeric', day: 'numeric' });

    if (weekDay.toDateString() === new Date().toDateString()) {
      daySquare.classList.add('current-day');
    }

    dayInterval.appendChild(daySquare);

    for (let hour = 8; hour <= 20; hour++) {
      const hourSlot = document.createElement('div');
      hourSlot.classList.add('hour');
      hourSlot.style.height = '60px'; 
    
      const hourLabel = document.createElement('span');
      hourLabel.classList.add('hour-label');
      hourLabel.textContent = `${hour}:00`; 
      hourSlot.appendChild(hourLabel); 

    daySquare.appendChild(hourSlot);
    }

    lectures.forEach(lecture => {
      let testLectures = ['You', 'are', 'a', 'mother', 'fucker'];
      const event = document.createElement('div');
      event.classList.add('event');
      for(let i = 0; i < testLectures.length; i++){
        event.textContent = testLectures;
      event.style.position = 'absolute';
      event.style.top = '60px'; //Hver hour er 30px. Hours starter fra 08:00 til 20:00, så hvis man vil placere en lecture kl. 08:00, så skal man skrive '0px'. Hvis den skal placeres kl. 14:00 er det 6 gange 30 fordi der er 6 timer fra kl. 08:00 til 14:00, og så skrive '360px'.
      daySquare.appendChild(event); 
      }
    });

    calendar.appendChild(dayInterval);
  }
}


function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    if(view === 'month') {
      nav++;
      load();
    } else {
      nav += 7;
      loadWeekView();
    }
  });

  document.getElementById('backButton').addEventListener('click', () => {
    if(view === 'month') {
      nav--;
      load();
    } else {
      nav -= 7;
      loadWeekView();
    }
  });

  document.getElementById('weekButton').addEventListener('click', () => {
    view = 'week';
    nav = 0;
    load();
  });

  document.getElementById('monthButton').addEventListener('click', () => {
    view = 'month';
    nav = 0;
    load();
  });
}

initButtons();
load();
