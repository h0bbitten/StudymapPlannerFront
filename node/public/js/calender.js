import {
  APIgetCall,
} from './script.js';

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

function generatePopupContentForDay(day, timeblocks) {
  // Filter the timeblocks for the selected day
  const timeblocksForDay = timeblocks.filter((block) => {
    const blockDate = new Date(block.startTime);
    return blockDate.getDate() === day;
  });

  // Generate the HTML content for the popup
  let popupContent = '';
  timeblocksForDay.forEach((block) => {
    popupContent += `
      <div class="timeblock">
        <div class="time">${convertToTimeString(block.startTime)} - ${convertToTimeString(block.endTime)}</div>
        <div class="title">${block.title}</div>
        <div class="description">${block.description}</div>
      </div>
    `;
  });

  return popupContent;
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
  const paddingDays = weekdays.indexOf(dateString);

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

  const monthTimeblocks = timeblocks.filter((block) => {
    const blockDate = new Date(block.startTime);
    return blockDate.getMonth() === month && blockDate.getFullYear() === year;
  });

  const daysWithTimeblocks = new Set(monthTimeblocks.map((block) => new Date(block.startTime).getDate()));

  for (let i = 1; i <= daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    daySquare.innerText = i;

    if (daysWithTimeblocks.has(i)) {
      const timeBlockIndicator = document.createElement('div');
      timeBlockIndicator.style.width = '12px';
      timeBlockIndicator.style.height = '12px';
      timeBlockIndicator.style.backgroundColor = '#7c8d85';
      timeBlockIndicator.style.borderRadius = '50%';
      daySquare.appendChild(timeBlockIndicator);
    }

    daySquare.addEventListener('click', () => {
      const popupContent = generatePopupContentForDay(i, monthTimeblocks);
      // Assuming you have a modal with id 'infoModal' and a content container with id 'modalContent'
      document.getElementById('modalContent').innerHTML = popupContent;
      document.getElementById('infoModal').style.display = 'flex';
    });
    calendar.appendChild(daySquare);
  }
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('infoModal').style.display = 'none';
});

function loadWeekView(timeblocks) {
  calendar.classList.add('week-view');
  const today = new Date();
  today.setDate(today.getDate() + nav);

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)));
  const date = moment(startOfWeek);

  document.getElementById('monthDisplay')
    .innerText = `${date.format('MMMM')} ${date.format('D')} - ${date.add(6, 'days').format('D')}, ${date.format('YYYY')} \n`;

  if (view === 'week') {
    const weekDaysDiv = document.getElementById('weekdays');
    $('#weekdays').css('padding-left', '53px');
    $('#weekdays').css('transform', 'translatex(0px) translatey(0px)');
    $('#weekdays').css('width', '1101px');

    if (weekDaysDiv) {
      let dayNameAbbreviated;
      let dateDisplay;
      let dayHeader;
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

  for (let hour = startStudyTime; hour <= endStudyTime; hour++) {
    $('.time-labels').append(`
      <div class="hour" style="height: ${hourPX}px; display: flex; align-items: center; padding-left: 10px;">
        ${hour}:00
      </div>
    `);
  }

  for (let day = 0; day < 7; day++) {
    $('#calendar').append(`<div class="day-interval-${day + 1}"></div>`);

    $(`.day-interval-${day + 1}`).append(`<div class="day" id="day${day + 1}" style="flex: 1"></div>`);
  }

  $('.week-view .day').css('height', dayPX);

  const currentWeekStartTime = getStartOfWeek(weekNumber, yearNumber);
  const currentWeekEndTime = getEndOfWeek(weekNumber, yearNumber);
  const now = moment().valueOf();
  if (currentWeekStartTime <= now && now <= currentWeekEndTime) {
    let weekdayIndex = moment(now).day();
    weekdayIndex = (weekdayIndex === 0) ? 7 : weekdayIndex;
    $(`#day${weekdayIndex}`).addClass('currentDay');
  }

  timeblocks.forEach((timeblock) => {
    addTimeBlock(timeblock.startTime, timeblock.endTime, timeblock.description, timeblock.description, timeblock.color, timeblock.type, timeblock.ID);
  });
  console.log(startStudyTime, endStudyTime);

  createLines();
  createAndMoveNowLine();
  createPopUp(timeblocks);
  popupBtnListener();
}

function popupBtnListener() {
  $(document).on('click', '.popupBtn', async function updateStatus() {
    const lectureID = $(this).data('lectureid');
    const courseID = $(this).data('courseid');
    const chosen = !$(this).hasClass('active');
    console.log(lectureID, courseID, chosen);
    await APIgetCall(`changeLectureChosen?lectureID=${lectureID}&courseID=${courseID}&chosen=${chosen}`, 'Error updating lecture status');
  });
}

function createLines() {
  $('.day').each(function dostuff() {
    const dayBox = $(this);
    const boxHeight = 1000 //dayBox.height();
    const numLines = 24;

    for (let i = 1; i < numLines; i++) {
      const line = $('<div class="line"></div>');
      const top = (boxHeight / numLines) * i;
      line.css('top', top + 'px');
      dayBox.append(line);
    }
  });
}

function createAndMoveNowLine() {
  const currentDay = $('.currentDay');
  if (currentDay.length > 0) {
    const nowLine = $('<div class="now-line"></div>');
    $(currentDay).append(nowLine);

    const updateLinePosition = () => {
      const theTime = moment();
      const minutes = minutesIntoDay(theTime);
      const top = minutes * minutePX;
      nowLine.css('top', top + 'px');
    };

    updateLinePosition();

    setInterval(updateLinePosition, 60000); // 1 minute
  }
}

function getStartOfWeek(week, year) {
  return moment().year(year).isoWeek(weekNumber).startOf('isoWeek').valueOf();
}

function getEndOfWeek(week, year) {
  return moment().year(year).isoWeek(weekNumber).endOf('isoWeek').valueOf();
}

function addTimeBlock(startTime, endTime, title, description, color, type, ID) {
  const currentWeekStartTime = getStartOfWeek(weekNumber, yearNumber);
  const currentWeekEndTime = getEndOfWeek(weekNumber, yearNumber);

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

  function createTimeBlockSegment(start, end, dayOfWeek) {
    if (startTime >= currentWeekStartTime && startTime < currentWeekEndTime) {
      $(`#day${dayOfWeek}`).append(createTimeBlock(start, end, title, description, color, type, ID));
    }
  }
}

function createTimeBlock(startTime, endTime, title, description, color, type, ID) {
  const top = (minutesIntoDay(startTime) * (1000 / 24 / 60));
  const minuteDuration = (endTime - startTime) / 60000;
  const height = minuteDuration * (1000 / 24 / 60);
  const html = `
      <div class="timeblock ${type}" ${type === 'lecture' ? `data-lectureID="${ID}"` : ''} style="height: ${height}px; background-color: ${color};
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

function createPopUp(timeblocks) {
  $('.timeblock').click(function popupHandler() {
    const description = $(this).find('.description').text();
    const title = $(this).find('.title').text();
    const time = $(this).find('.time').text();
    const type = $(this).attr('class').split(' ')[1];
    const lecture = type === 'lecture';
    console.log(type);
    let lectureID;
    let courseID;
    let courseLink;
    let status;
    if (lecture) {
      console.log('This is a lecture');
      lectureID = $(this).data('lectureid');
      console.log(lectureID);
      timeblocks.forEach((block) => {
        if (block.ID === lectureID) {
          console.log(block);
          courseID = block.courseID;
          courseLink = block.courseURL;
          status = block.status;
        }
      });
    }

    const modalContentHTML = `
      <div class="modal-header">${title}</div>
      <div class="modal-section">
        <div class="section-title">Course</div>
        <div>${description}</div>
        ${lecture ? `<a href="${courseLink}" target="_blank">Go to course</a>` : ''}
      </div>
      <div class="modal-section">
        <div class="section-title">Time</div>
        <div>${time}</div>
      </div>
      ${lecture ? `<button class="btn ${status} popupBtn" data-lectureID="${lectureID}" data-courseID="${courseID}">${status === 'active' ? 'I already studied this subject' : 'I did not study for this subject'}</button>` : ''}
    `;
    $('#modalContent').html(modalContentHTML);
    $('#infoModal').css('display', 'flex');
  });

  $('.close').click(() => {
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

  // weekButton don't work as intended now because of the weekNumber and yearNumber
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
