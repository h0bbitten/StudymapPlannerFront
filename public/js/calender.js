export { loadCalendar};

let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const storedLectures = localStorage.getItem('lectures'); // Henter lectureNames fra local storage som er gemt i schedule.js
let lectures = storedLectures ? JSON.parse(storedLectures) : [];

function loadCalendar() {
  initButtons();
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


  $('#calendar').append(`<div class="time-labels"></div>`)

  for (let hour = 1; hour <= 24; hour++) {
    $('.time-labels').append(`<div class="hour" style="height: 35px; display: flex; align-items: center; padding-left: 10px;">${hour}:00</div>`)
  }

  for (let day = 0; day < 7; day++) {

    $('#calendar').append(`<div class="day-interval-${day}"></div>`)
  


    let weekDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + day);


    $(`.day-interval-${day}`).append(`<div class="day" id="day${day}" style="flex: 1;">${weekDay.getDate()}</div>`);

    if (weekDay.toDateString() === new Date().toDateString()) {
      $(`#day${day}`).addClass('current-day');
    }

    for (let hour = 1; hour <= 24; hour++) {

      $(`.day-interval-${day}`).append(`<div class="hour" id="hour${hour}" style="height: 35px;"></div>`)
    }



/*     if (lectures.length > 0) {
      const event = document.createElement('div');
      event.classList.add('event');
      for(let i = 0; i < lectures.length; i++){
      event.textContent = lectures;
      event.style.position = 'absolute';
      event.style.top = '120px'; //Hver hour er 30px. Hours starter fra 08:00 til 20:00, så hvis man vil placere en lecture kl. 08:00, så skal man skrive '30px'. Hvis den skal placeres kl. 14:00 er det 6 gange 30 fordi der er 6 timer fra kl. 08:00 til 14:00, og så skrive '360px'.
      daySquare.appendChild(event); 
      }
    };

    calendar.appendChild(dayInterval); */
  }
    //console.log(lectures);
    lectures.forEach(lecture => {
      //console.log(lecture.startTime, lecture.endTime, lecture.title, lecture.description, lecture.color);
      addTimeBlock(lecture.startTime, lecture.endTime, lecture.title, lecture.description, lecture.color);
    })
}
function addTimeBlock(startTime, endTime, title, description, color) {
  let currentDate = new Date();
  let currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
  let currentWeekEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - currentDate.getDay()));

  let startDate = new Date(startTime * 1000);

  if (startDate >= currentWeekStart && startDate <= currentWeekEnd) {
    // Calculate the day of the week (Monday = 0, Tuesday = 1, ...)
    let dayOfWeek = startDate.getDay();
    // Adjust to start from 1 (Monday = 1, Tuesday = 2, ...)
    if (dayOfWeek === 0) {
      dayOfWeek = 7; // Sunday
    }
    // Append the time block to the appropriate day and hour
    $(`#day${dayOfWeek}`).append(createTimeBlock(startTime, endTime, title, description, color));
  }
}
function createTimeBlock(startTime, endTime, title, description, color) {
  // Calculate the height of the timeblock based on the duration
  const duration = (endTime - startTime) / 3600; // Converting seconds to hours
  const height = duration * 35; // Assuming each hour is 35px tall

  console.log(startTime);
  // Create the HTML markup for the timeblock
  const top = (new Date(startTime * 1000).getHours()) * 35;
  const html = `
      <div class="timeblock" style="height: ${height}px; background-color: ${color}; position: absolute; top: ${top}px;">
          <div class="time">${new Date(startTime * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${new Date(endTime * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
          <div class="title">${title}</div>
          <div class="description">${description}</div>
      </div>
  `;
  return html;
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
