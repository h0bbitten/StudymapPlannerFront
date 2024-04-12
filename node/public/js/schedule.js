import {applyTheme, LoadingScreen, displayProfile, APIgetCall} from './script.js';
import {loadCalendar} from './calender.js';

async function scheduleInitialization() {

  let loading = new LoadingScreen();
  loading.add();
  loading.show();

  try {
    let User = await APIgetCall(`getUserData`, 'Error fetching user data');
    console.log(User);

    displayProfile(User);
    displayCal(User);

    loading.hide();
  }
  catch (error) {

    loading.hide();

    console.error('Failed to display profile info:', error);
  }
  
}

async function displayCal(profile) {
  
  let Timeblocks = await APIgetCall('calculateSchedule', 'Error calculating schedule');
  console.log(Timeblocks);
  loadCalendar(Timeblocks);
}

applyTheme();
scheduleInitialization();  