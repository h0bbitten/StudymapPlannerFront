import {
  applyTheme, LoadingScreen, displayProfile, APIgetCall,
} from './script.js';
import {loadCalendar, initButtons} from './calender.js';

// function that initializes the schedule page
async function scheduleInitialization() {
  LoadingScreen.add();
  LoadingScreen.show();
  try {
    const User = await APIgetCall('getUserData', 'Error fetching user data');
    console.log(User);

    displayProfile(User);
    displayCal(User.schedule);

    LoadingScreen.hide();
  } catch (error) {
    LoadingScreen.hide();

    console.error('Failed to display profile info:', error);
  }
}

// function that displays the schedule
async function displayCal(schedule, ForceRecalculate = false) {
  const Algorithm = schedule.algorithm;
  const Schedule = await APIgetCall(`getSchedule?algorithm=${Algorithm}&forcerecalculate=${ForceRecalculate}`, 'Error calculating schedule');
  console.log(Schedule);
  if (Schedule.error) {
    console.error(Schedule.error);
    window.location.href = Schedule.redirect;
  }
  initButtons(Schedule.Timeblocks);
  loadCalendar(Schedule.Timeblocks);
}

// function that recalculates the schedule
async function recalculateListener() {
  document.getElementById('recalculateButton').addEventListener('click', async () => {
    const User = await APIgetCall('getUserData', 'Error fetching user data');
    const Schedule = await APIgetCall(`getSchedule?algorithm=${User.schedule.algorithm}&forcerecalculate=${true}`, 'Error calculating schedule');
    console.log(Schedule);
    if (Schedule.error) {
      console.error(Schedule.error);
      window.location.href = Schedule.redirect;
    }
    loadCalendar(Schedule.Timeblocks);
    initButtons(Schedule.Timeblocks);
  });
}

applyTheme();
scheduleInitialization();
recalculateListener();
