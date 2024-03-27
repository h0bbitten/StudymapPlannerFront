let nav = 0;
const calendar = document.getElementById('calendar');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = (weekdays.indexOf(dateString.split(', ')[0]) + 6) % 7;


  document.getElementById('monthDisplay').innerText = 
  `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

calendar.innerHTML = '';

// Loop over all the days in the calendar
for(let i = 1; i <= paddingDays + daysInMonth; i++) {
  const daySquare = document.createElement('div');
  daySquare.classList.add('day');

  if (i > paddingDays) {
    const dayNumber = i - paddingDays;
    daySquare.innerText = dayNumber;

    const eventPara = document.createElement('p');
    eventPara.classList.add('event');

    // Add your event to Friday the 1st
    if (dayNumber === 14 && (paddingDays === 5 || (paddingDays === 4 && year % 4 === 0 && month === 2))) {
      // Since your calendar week starts on Monday, paddingDays 5 would be Friday.
      eventPara.textContent = 'Lecture 1'; // Replace with your actual event name
      daySquare.appendChild(eventPara);
    }

    if (dayNumber === day && nav === 0) {
      daySquare.id = 'currentDay';
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

initButtons();
load();