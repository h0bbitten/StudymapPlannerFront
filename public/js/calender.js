let nav = 0;
let view = 'month';
const calendar = document.getElementById('calendar');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function load() {
  if (view === 'week') {
    loadWeekView();
  } else {
    loadMonthView();
  }
}

function loadMonthView() {
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

    calendar.appendChild(daySquare);    
  }
}

function loadWeekView() {
  const today = new Date();
  today.setDate(today.getDate() + nav);

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)));

  document.getElementById('monthDisplay').innerText = 
    `Week of ${startOfWeek.toLocaleDateString('en-us', { month: 'long', day: 'numeric' })}`;

  calendar.innerHTML = '';

  for(let i = 0; i < 7; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    let weekDay = new Date(startOfWeek.setDate(startOfWeek.getDate() + (i === 0 ? 0 : 1)));
    daySquare.innerText = weekDay.getDate();
    calendar.appendChild(daySquare);
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
