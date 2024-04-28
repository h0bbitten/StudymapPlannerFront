import {
  applyTheme, LoadingScreen, displayProfile, APIgetCall,
} from './script.js';
import {loadCalendar, initButtons} from './calender.js';

async function scheduleInitialization() {
  LoadingScreen.add();
  LoadingScreen.show();
  try {
    const User = await APIgetCall('getUserData', 'Error fetching user data');
    console.log(User);

    displayProfile(User);
    displayCal();

    LoadingScreen.hide();
  } catch (error) {
    LoadingScreen.hide();

    console.error('Failed to display profile info:', error);
  }
}

async function displayCal() {
  const Timeblocks = await APIgetCall('calculateSchedule', 'Error calculating schedule');
  console.log(Timeblocks);
  initButtons(Timeblocks);
  loadCalendar(Timeblocks);
}

applyTheme();
scheduleInitialization();
