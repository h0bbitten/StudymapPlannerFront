document.addEventListener('DOMContentLoaded', function () {
    // ... all of your existing script code goes here ...
// Get the current date
const currentDate = new Date();

// Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const currentDayOfWeek = currentDate.getDay();

// Calculate the start date of the week (assuming Monday is the first day of the week)
const startDate = new Date(currentDate);
startDate.setDate(currentDate.getDate() - currentDayOfWeek + 1);

// Create an array to store the dates of the week
const weekDates = [];

// Generate the dates for the week
for (let i = 0; i < 7; i++) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + i);
  weekDates.push(date);
}

// Select the container where the dates will be displayed
const weekDatesContainer = document.getElementById('weekDatesContainer');

// Clear existing content
weekDatesContainer.innerHTML = '';

// Create and append the dates of the week to the container
weekDates.forEach((date, index) => {
  const dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const dayOfMonth = date.toLocaleDateString('en-GB', { day: 'numeric' });
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.toLocaleDateString('en-GB', { year: 'numeric' });

  // Create a new div element for each date and add it to the container
  const dateDiv = document.createElement('div');
  dateDiv.textContent = `Day ${index + 1}: ${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
  weekDatesContainer.appendChild(dateDiv);
});

// Select the table where the dates will be displayed
const weekDatesTable = document.querySelector('#weekDatesContainer table');

// Generate the dates for the week and add them to the table
weekDates.forEach((date, index) => {
  const dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const dayOfMonth = date.toLocaleDateString('en-GB', { day: 'numeric' });
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.toLocaleDateString('en-GB', { year: 'numeric' });

  // Create a new row and cells for the date
  const row = weekDatesTable.insertRow();
  const dayCell = row.insertCell();
  const dateCell = row.insertCell();

  // Set the cell text
  dayCell.textContent = `Day ${index + 1}: ${dayOfWeek}`;
  dateCell.textContent = `${dayOfMonth} ${month} ${year}`;
});
});
