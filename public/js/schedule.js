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

  $("#loading").show();
  $("#loading-overlay").show();

  try {
    let User = await getMoodleInfo(token);
    displayProfile(User);

    $("#loading").hide();
    $("#loading-overlay").hide();

  }
  catch (error) {

    $("#loading").hide();
    $("#loading-overlay").hide();

    console.error('Failed to display profile info:', error);
  }
  
}

function displayProfile(profile) {
  $("#navbar").append($(`<div id="user_profile">`).append(`<p> Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`));
}

applyTheme();
scheduleInitialization();  