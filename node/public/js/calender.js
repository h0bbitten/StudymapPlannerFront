export default loadCalendar;

let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const now = moment();
let weekNumber = now.isoWeek();
let yearNumber = now.year();

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
  console.log(Timeblocks);
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
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 0)));
 
  const date = moment(today);
  const weekNumber = date.isoWeek() + 1;

  document.getElementById('monthDisplay').innerText = `${date.format('MMMM')} ${date.format('YYYY')} \n Week: ${weekNumber}`;

  calendar.innerHTML = '';

  $('#calendar').append('<div class="time-labels"></div>');

  for (let hour = startStudyTime; hour <= endStudyTime; hour++) {
    $('.time-labels').append(`
                              <div class="hour"
                              style="height: ${hourPX}px; display: flex; align-items: center; padding-left: 10px;">${hour}:00</div>
                            `);
  }

  for (let day = 1; day <= 7; day++) {
    $('#calendar').append(`<div class="day-interval-${day}"></div>`);

    const weekDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + day);

    $(`.day-interval-${day}`).append(`<div class="day" id="day${day}" style="flex: 1;">${weekDay.getDate()}</div>`);

    for (let hour = 1; hour <= 24; hour++) {
      $(`.day-interval-${day}`).append(`<div class="hour" id="hour${hour}" style="height: ${hourPX}px;"></div>`);
    }

    $('.week-view .day').css('height', dayPX);
  }
  const currentWeekStartTime = getStartOfWeek(weekNumber, yearNumber);
  const currentWeekEndTime = getEndOfWeek(weekNumber, yearNumber);
  console.log(currentWeekStartTime, currentWeekEndTime);
  Timeblocks.forEach((lecture) => {
    addTimeBlock(lecture.startTime, lecture.endTime, lecture.title, lecture.description, lecture.color);
  });
  console.log(startStudyTime, endStudyTime);
}

function getStartOfWeek(week, year) {
  return moment().year(year).isoWeek(weekNumber).startOf('isoWeek').valueOf();
}

function getEndOfWeek(week, year) {
  return moment().year(year).isoWeek(weekNumber).endOf('isoWeek').valueOf();
}

function addTimeBlock(startTime, endTime, title, description, color) {
  const currentWeekStartTime = getStartOfWeek(weekNumber, yearNumber);
  const currentWeekEndTime = getEndOfWeek(weekNumber, yearNumber);

  // Function to add a time block to a specific day.
  function createTimeBlockSegment(start, end, dayOfWeek) {
    if (startTime >= currentWeekStartTime && startTime < currentWeekEndTime) {
      $(`#day${dayOfWeek}`).append(createTimeBlock(start, end, title, description, color));
    }
  }

  // Iterate as long as startTime is within the current week and there is still time left in the block
  while (startTime < endTime && startTime < currentWeekEndTime) {
    const endOfDay = moment(startTime).endOf('day').valueOf();
    const dayOfWeek = moment(startTime).isoWeekday();

    if (endTime <= endOfDay) {
      createTimeBlockSegment(startTime, endTime, dayOfWeek);
      break; 
    } else {
      createTimeBlockSegment(startTime, endOfDay, dayOfWeek);
      startTime = moment(endOfDay + 1); 

      if (startTime.valueOf() >= currentWeekEndTime) {
        break;
      }
    }
  }
}




function createTimeBlock(startTime, endTime, title, description, color) {
  const top = (minutesIntoDay(startTime) * (1000 / 24 / 60));
  const minuteDuration = (endTime - startTime) / 60000;
  const height = minuteDuration * (1000 / 24 / 60);

  console.log(startTime);
  // Create the HTML markup for the timeblock
  const html = `
      <div class="timeblock" style="height: ${height}px; background-color: ${color}; position: absolute; top: ${top}px; width: 130px; font-size: 13px">
      <div class="time">${convertToTimeString(startTime)} - ${convertToTimeString(endTime)}</div>
      <div class="title">${title}</div>
          <div class="description" style="display: none;">${description}</div>
      </div>
  `;
  return html;
}

function convertToTimeString(timestamp) {
  const momentObj = moment(timestamp);
  const timeString = momentObj.format('HH:mm');

  return timeString;
}

function minutesIntoDay(timestamp) {
  const momentObj = moment(timestamp);
  const startOfDay = momentObj.clone().startOf('day');
  const minutesDifference = momentObj.diff(startOfDay, 'minutes');

  return minutesDifference;
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    if (view === 'month') {
      nav++;
      load();
    } else {
      nav += 7;
      weekNumber++;
      loadWeekView();
    }
  });

  document.getElementById('backButton').addEventListener('click', () => {
    if (view === 'month') {
      nav--;
      loadCalendar();
    } else {
      nav -= 7;
      weekNumber--;
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
