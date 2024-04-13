export default loadCalendar;

let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// const startStudyTimeValue = sessionStorage.getItem('startStudyTime');
const startStudyTime = 0;//= parseInt(startStudyTimeValue, 10);

// const endStudyTimeValue = sessionStorage.getItem('endStudyTime');
const endStudyTime = 24;//= parseInt(endStudyTimeValue, 10);

const dayPX = (1000 / 24) * (endStudyTime - startStudyTime);
const hourPX = dayPX / (endStudyTime - startStudyTime);
const minutePX = hourPX / 60;

let Timeblocks = [];
function loadCalendar(inputTimeblocks) {
  Timeblocks = inputTimeblocks;
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

  if (paddingDays === -1) {
    paddingDays = 6;
  }

  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
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

      if (month === 2 && lectureIndex < Timeblocks.length) {
        const eventPara = document.createElement('p');
        eventPara.classList.add('event');
        eventPara.textContent = Timeblocks[lectureIndex++];
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

  document.getElementById('monthDisplay').innerText = `Week of ${startOfWeek.toLocaleDateString('en-us', { month: 'long', day: 'numeric' })}`;

  calendar.innerHTML = '';

  $('#calendar').append('<div class="time-labels"></div>');

  for (let hour = startStudyTime; hour <= endStudyTime; hour++) {
    $('.time-labels').append(`<div class="hour" style="height: ${hourPX}px; display: flex; align-items: center; padding-left: 10px;">${hour}:00</div>`);
  }

  for (let day = 1; day <= 7; day++) {
    $('#calendar').append(`<div class="day-interval-${day}"></div>`);

    const weekDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + day);

    $(`.day-interval-${day}`).append(`<div class="day" id="day${day}" style="flex: 1;">${weekDay.getDate()}</div>`);

    if (weekDay.toDateString() === new Date().toDateString()) {
      $(`#day${day}`).addClass('current-day');
    }

    for (let hour = 1; hour <= 24; hour++) {
      $(`.day-interval-${day}`).append(`<div class="hour" id="hour${hour}" style="height: ${hourPX}px;"></div>`);
    }

    $('.week-view .day').css('height', dayPX);
  }
  // console.log(Timeblocks);
  Timeblocks.forEach((lecture) => {
    // console.log(lecture.startTime, lecture.endTime, lecture.title, lecture.description, lecture.color);
    addTimeBlock(lecture.startTime, lecture.endTime, lecture.title, lecture.description, lecture.color);
  });

  console.log(startStudyTime, endStudyTime);
}
function addTimeBlock(startTime, endTime, title, description, color) {
  const currentDate = new Date();
  const currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
  const currentWeekEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - currentDate.getDay()));
  $('.timeblock').css('font-size', '13px');
  $('.timeblock').css('width', '130px');

  const startDate = new Date(startTime * 1000);

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
  const startHour = new Date(startTime * 1000).getHours() - startStudyTime;
  const startMinutes = new Date(startTime * 1000).getMinutes();
  const duration = (endTime - startTime) / 3600;
  const height = duration * hourPX;
  const top = (startHour * hourPX) + (startMinutes * minutePX);

  console.log(startTime);
  // Create the HTML markup for the timeblock
  const html = `
      <div class="timeblock" style="height: ${height}px; background-color: ${color}; position: absolute; top: ${top}px;">
          <div class="time">${new Date(startTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div class="title">${title}</div>
          <div class="description" style="display: none;">${description}</div>
      </div>
  `;
  return html;
}
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    if (view === 'month') {
      nav++;
      load();
    } else {
      nav += 7;
      loadWeekView();
    }
  });

  document.getElementById('backButton').addEventListener('click', () => {
    if (view === 'month') {
      nav--;
      loadCalendar();
    } else {
      nav -= 7;
      loadWeekView();
    }
  });

  document.getElementById('weekButton').addEventListener('click', () => {
    view = 'week';
    nav = 0;
    loadCalendar();
  });

  document.getElementById('monthButton').addEventListener('click', () => {
    view = 'month';
    nav = 0;
    loadCalendar();
  });
}
