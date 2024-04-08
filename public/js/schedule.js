import {applyTheme, LoadingScreen, displayProfile} from './script.js';
import {loadCalendar} from './calender.js';

let userid = sessionStorage.getItem("userid");

async function getUserData(userid){
  try {
    const response = await fetch(`http://localhost:3000/getUserData?userid=${userid}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  } 
  catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }

}

async function scheduleInitialization() {

  let loading = new LoadingScreen();
  loading.add();
  loading.show();

  try {
    let User = await getUserData(userid);
    console.log(User);
    displayProfile(User);
    displayCalLectures(User);

    loading.hide();

  }
  catch (error) {

    loading.hide();

    console.error('Failed to display profile info:', error);
  }
  
}

function displayCalLectures(profile) {
  
  let currentTime = Math.floor(Date.now() / 1000);
  const lectures = [];
  profile.courses.forEach(course => {
    course.contents.forEach(lecture => {
      let startTime = currentTime;
      let endTime = currentTime + (60 * 60);

      let timeBlock = {
        title: course.fullname,
        description: lecture.name,
        startTime: startTime,
        endTime: endTime,
        color: course.color
      };

      currentTime = endTime;

      lectures.push(timeBlock);
    });
  });
  localStorage.setItem('lectures', JSON.stringify(lectures));

  loadCalendar();
}

applyTheme();
scheduleInitialization();  