import {applyTheme} from './script.js';

let token = sessionStorage.getItem("token");

async function getMoodleInfo(token){
  try {
    const response = await fetch(`http://localhost:3000/getMoodleInfo?token=${token}`);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  } 
  catch (error) {
    console.error('Error fetching course pages:', error);
    throw error;
  }

}

async function scheduleInitialization() {

  LoadingScreen('show');

  try {
    let User = await getMoodleInfo(token);
    console.log(User);
    displayProfile(User);

    console.log(Algorithm(User));
    LoadingScreen('hide');
    
  }
  catch (error) {

    LoadingScreen('hide');

    console.error('Failed to display profile info:', error);
  }
  
}

function LoadingScreen(toggle){
  if (toggle === 'show') {
    $("#loading").show();
    $("#loading-overlay").show();
  }
  if (toggle === 'hide') {
    $("#loading").hide();
    $("#loading-overlay").hide();
  }
}

function displayProfile(profile) {
  $("#user_profile").html(`<p>Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`);

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