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
  $("#navbar").append($(`<div id="user_profile">`).append(`<p> Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`));
}

applyTheme();
scheduleInitialization();  