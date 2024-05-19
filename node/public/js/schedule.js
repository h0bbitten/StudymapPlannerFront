import {
  applyTheme, LoadingScreen, displayProfile, APIgetCall,
} from './script.js';
import {loadCalendar, initButtons} from './calender.js';

async function scheduleInitialization() {
  LoadingScreen.add();
  LoadingScreen.show();
  try {
    const User = await APIgetCall('getUserData', 'Error fetching user data');
    console.log('User data:', User);

    if (User && User.schedule && User.schedule.algorithm) {  
      console.log('User schedule:', User.schedule);
      displayProfile(User);
      displayCal(User.schedule);
    } else {
      console.error('User data or schedule is missing or incomplete.');
    }
  } catch (error) {
    console.error('Failed to display profile info:', error);
  } finally {
    LoadingScreen.hide();
  }
}

async function displayCal(schedule, ForceRecalculate = false) {
  if (!schedule || !schedule.algorithm) {
    console.error('Schedule data is missing or incomplete.');
    return;
  }
  const Algorithm = schedule.algorithm;
  try {
    const Schedule = await APIgetCall(`getSchedule?algorithm=${Algorithm}&forcerecalculate=${ForceRecalculate}`, 'Error calculating schedule');
    console.log(Schedule);
    if (Schedule.error) {
      console.error(Schedule.error);
      window.location.href = Schedule.redirect;
    } else {
      initButtons(Schedule.Timeblocks);
      loadCalendar(Schedule.Timeblocks);
    }
  } catch (error) {
    console.error('Failed to load schedule:', error);
  }
}



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
    // $('#container').empty();
    // displayCal(User.schedule, true);
  });
}

applyTheme();
scheduleInitialization();
recalculateListener();
