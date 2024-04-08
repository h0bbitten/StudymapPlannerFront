let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const storedLectureNames = localStorage.getItem('lectureNames'); // Henter lectureNames fra local storage som er gemt i schedule.js
let lectures = storedLectureNames ? JSON.parse(storedLectureNames) : [];

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

  const timeLabelContainer = document.createElement('div');
  timeLabelContainer.classList.add('time-labels');

  for (let hour = 8; hour <= 20; hour++) {
    const hourLabel = document.createElement('div');
    hourLabel.classList.add('hour');
    hourLabel.textContent = `${hour}:00`;
    hourLabel.style.height = '35px'; // Set the height to match your hour slots.
    hourLabel.style.display = 'flex'; // Use flex display to align text vertically.
    hourLabel.style.alignItems = 'center'; // Align text in the center of the div.
    hourLabel.style.paddingLeft = '10px'; // Adjust padding as needed.
    timeLabelContainer.appendChild(hourLabel);
  }
  calendar.appendChild(timeLabelContainer);

  for (let i = 0; i < 7; i++) {
    const dayInterval = document.createElement('div');
    dayInterval.classList.add('day-interval');

    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    daySquare.style.flex = '1';

    let weekDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    if (weekDay.toDateString() === new Date().toDateString()) {
      daySquare.classList.add('current-day');
    }
    daySquare.innerText = weekDay.getDate(); // This sets the date number on the daySquare.
    dayInterval.appendChild(daySquare);

    for (let hour = 8; hour <= 20; hour++) {
      const hourSlot = document.createElement('div');
      hourSlot.classList.add('hour');
      hourSlot.style.height = '35px';
      dayInterval.appendChild(hourSlot); // Append hourSlot to dayInterval instead of daySquare.
    }

    if (lectures.length > 0) {
      const event = document.createElement('div');
      event.classList.add('event');
      for(let i = 0; i < lectures.length; i++){
      event.textContent = lectures;
      event.style.position = 'absolute';
      event.style.top = '120px'; //Hver hour er 30px. Hours starter fra 08:00 til 20:00, så hvis man vil placere en lecture kl. 08:00, så skal man skrive '30px'. Hvis den skal placeres kl. 14:00 er det 6 gange 30 fordi der er 6 timer fra kl. 08:00 til 14:00, og så skrive '360px'.
      daySquare.appendChild(event); 
      }
    };

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
