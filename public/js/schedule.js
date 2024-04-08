import {applyTheme, LoadingScreen, displayProfile} from './script.js';

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


  const lectureNames = [];
  profile.courses.forEach(course => {
    course.contents.forEach(lecture => {
      lectureNames.push(lecture.name);
    });
  });
  localStorage.setItem('lectureNames', JSON.stringify(lectureNames));

 // if (profile.courses && profile.courses.length > 0) {
  //  profile.courses.forEach(course => {
  //    const courseLecturesList = $(`<div class="course-lectures"><h3>${course.fullname} Lectures:</h3><ul></ul></div>`);
  //    course.contents.forEach(lecture => {
  //      courseLecturesList.find("ul").append(`<li>${lecture.name}</li>`);
   //   });
      //$("#courses").append(courseLecturesList);
     // $("#courses").append(courseLecturesList);
    //});
  //} else {
  //  $("#courses").append("<p>You are not enrolled in any courses.</p>");
  //}
}

applyTheme();
scheduleInitialization();  