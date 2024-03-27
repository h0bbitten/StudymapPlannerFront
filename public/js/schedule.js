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

  let User = await getMoodleInfo(token);

  try {
    displayProfile(User);
  }
  catch (error) {
    console.error('Failed to display profile info:', error);
  }
  
}

function displayProfile(profile) {
  $("#navbar").append($(`<div id="user_profile">`).append(`<p> Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`));
}

applyTheme();
scheduleInitialization();  