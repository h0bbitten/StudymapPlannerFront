document.addEventListener('DOMContentLoaded', function () {
    // Variables to hold the current week's start and end dates
    let weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1); // Set to Monday of the current week
    weekStart.setHours(0, 0, 0, 0); // Remove time part
  
    // Function to update the week view
    function updateWeek(change) {
      if (change !== 0) {
        // If change is not zero, update the week start date
        weekStart.setDate(weekStart.getDate() + 7 * change);
      }
  
      // Create an array to store the dates of the week
      const weekDates = [];
  
      // Generate the dates for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }
  
      // Select all the .day elements
      const dayElements = document.querySelectorAll('.days_container .day');
  
      // Populate the .day elements with the dates
      dayElements.forEach((dayElement, index) => {
        const date = weekDates[index];
        const dayOfMonth = date.getDate();
        const month = date.toLocaleDateString('en-GB', { month: 'short' });
        const year = date.getFullYear();
  
        // Set the text of day elements to include the date
        dayElement.textContent = dayElement.textContent.replace(/\d{1,2} \w+ \d{4}/, ''); // Clear previous date
        dayElement.textContent += ` ${dayOfMonth} ${month} ${year}`;
      });
    }
  
    // Initial update for the current week
    updateWeek(0);
  
    // Event listener for previous week button
    document.getElementById('prevWeekBtn').addEventListener('click', function() {
      updateWeek(-1);
    });
  
    // Event listener for next week button
    document.getElementById('nextWeekBtn').addEventListener('click', function() {
      updateWeek(1);
    });
  });
  