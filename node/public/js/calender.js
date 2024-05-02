export { loadCalendar, initButtons };

let nav = 0;
let view = 'week';
const calendar = document.getElementById('calendar');

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
function loadCalendar(inputTimeblocks) {
  if (view === 'week') {
    loadWeekView(inputTimeblocks);
  } else {
    loadMonthView(inputTimeblocks);
  }
}

function loadMonthView(timeblocks) {
  calendar.classList.remove('week-view');
  const baseDate = new Date();
  const dt = new Date(baseDate.getFullYear(), baseDate.getMonth() + nav, 1); 

  const month = dt.getMonth();
  const year = dt.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = dt.toLocaleDateString('en-GB', {
    weekday: 'long',
  });

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let paddingDays = weekdays.indexOf(dateString);

  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-US', { month: 'long' })} ${year}`;
  calendar.innerHTML = '';

  const weekDaysDiv = document.getElementById('weekdays');
  $('#weekdays').css('padding-left', '344px');
  $('#weekdays').css('transform', 'translatex(0px) translatey(0px)');
  $('#weekdays').css('width', '1045px');

  weekDaysDiv.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement('div');
    dayHeader.classList.add('day-header');
    dayHeader.textContent = weekdays[i];
    weekDaysDiv.appendChild(dayHeader);
  }


  for (let i = 0; i < paddingDays; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day', 'padding');
    calendar.appendChild(daySquare);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    daySquare.innerText = i;
    calendar.appendChild(daySquare);
  }
}

function loadWeekView(timeblocks) {
  calendar.classList.add('week-view');
  const today = new Date();
  today.setDate(today.getDate() + nav);

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)));
  const date = moment(startOfWeek);

  // const weekNumber = date.isoWeek();

  document.getElementById('monthDisplay')
 .innerText = `${date.format('MMMM')} ${date.format('D')} - ${date.add(6, 'days').format('D')}, ${date.format('YYYY')} \n`;

 if(view === 'week'){ 
 const weekDaysDiv = document.getElementById('weekdays');
 //$(weekDaysDiv).css('width', '1102px');
 $('#weekdays').css('padding-left', '53px');
 $('#weekdays').css('transform', 'translatex(0px) translatey(0px)');
 $('#weekdays').css('width', '1101px');
 
  if (weekDaysDiv) {
    let dayNameAbbreviated, dateDisplay, dayHeader;
    for (let i = 0; i < 7; i++) {
      const weekDay = moment(startOfWeek).add(i, 'days');
      dayNameAbbreviated = weekDay.format('ddd');
      dateDisplay = weekDay.format('M/D');
      dayHeader = weekDaysDiv.children[i];
      if (dayHeader) {
        dayHeader.textContent = `${dayNameAbbreviated} ${dateDisplay}`;
      }
    }
  }
} 

  calendar.innerHTML = '';

  $('#calendar').append('<div class="time-labels"></div>');

  // Add hour marks
  for (let hour = startStudyTime; hour <= endStudyTime; hour++) {
    $('.time-labels').append(`
      <div class="hour" style="height: ${hourPX}px; display: flex; align-items: center; padding-left: 10px;">
        ${hour}:00
      </div>
    `);
  }

  for (let day = 0; day < 7; day++) {
    $('#calendar').append(`<div class="day-interval-${day + 1}"></div>`);

    $(`.day-interval-${day + 1}`).append(`<div class="day" id="day${day + 1}" style="flex: 1;"></div>`);

    for (let hour = 1; hour <= 24; hour++) {
      $(`.day-interval-${day + 1}`).append(`<div class="hour" id="hour${hour}" style="height: ${hourPX}px;"></div>`);
    }
  }

  $('.week-view .day').css('height', dayPX);

  const currentWeekStartTime = getStartOfWeek(weekNumber, yearNumber);
  const currentWeekEndTime = getEndOfWeek(weekNumber, yearNumber);

  timeblocks.forEach((lecture) => {
    addTimeBlock(lecture.startTime, lecture.endTime, lecture.description, lecture.description, lecture.color);
  });
  console.log(startStudyTime, endStudyTime);

  createPopUp();
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

  function createTimeBlockSegment(start, end, dayOfWeek) {
    if (startTime >= currentWeekStartTime && startTime < currentWeekEndTime) {
      $(`#day${dayOfWeek}`).append(createTimeBlock(start, end, title, description, color));
    }
  }

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
  const html = `
      <div class="timeblock" style="height: ${height}px; background-color: ${color};
      position: absolute; top: ${top}px; width: 130px; font-size: 13px">
      
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

function createPopUp() {
  $('.timeblock').click(function() {
    const description = $(this).find('.description').text();
    const title = $(this).find('.title').text();
    const time = $(this).find('.time').text();

    const modalContentHTML = `
      <div class="modal-header">${title}</div>
      <div class="modal-section">
        <div class="section-title">Course</div>
        <div>${description}</div>
      </div>
      <div class="modal-section">
        <div class="section-title">Time</div>
        <div>${time}</div>
      </div>
      <!-- Add more sections as needed -->
    `;
    $('#modalContent').html(modalContentHTML);
    $('#infoModal').css('display', 'flex');
  });

  $('.close').click(function() {
    $('#infoModal').css('display', 'none');
  });
}

function initButtons(timeblocks) {
  document.getElementById('nextButton').addEventListener('click', () => {
    if (view === 'month') {
      nav++;
      loadCalendar(timeblocks);
    } else {
      nav += 7;
      weekNumber++;
      loadWeekView(timeblocks);
    }
  });

  document.getElementById('backButton').addEventListener('click', () => {
    if (view === 'month') {
      nav--;
      loadCalendar(timeblocks);
    } else {
      nav -= 7;
      weekNumber--;
      loadWeekView(timeblocks);
    }
  });

  document.getElementById('weekButton').addEventListener('click', () => {
    view = 'week';
    nav = 0;
    weekNumber = now.isoWeek();
    yearNumber = now.year();
    loadCalendar(timeblocks);
  });

  document.getElementById('monthButton').addEventListener('click', () => {
    view = 'month';
    nav = 0;
    weekNumber = now.isoWeek();
    yearNumber = now.year();
    loadCalendar(timeblocks);
  });

  document.getElementById('todayButton').addEventListener('click', () => {
    view = 'week';
    nav = 0;
    weekNumber = now.isoWeek();
    yearNumber = now.year();
    loadCalendar(timeblocks);
  });
}
