import {applyTheme} from './script.js';

let token = sessionStorage.getItem("token");

class MoodleUser {
    constructor() {
      this.wsfunction = new WSfunction();
    }
    
} 
  
class WSfunction {
    constructor() {}
  
    async core_course_get_enrolled_courses_by_timeline_classification() {
      try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=core_course_get_enrolled_courses_by_timeline_classification`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        return response.json();
      } 
      catch (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
      }
    }
    async core_webservice_get_site_info() {
      try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=core_webservice_get_site_info`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        return response.json();
      } 
      catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
      }
    }
}
  
  async function scheduleInitialization() {
    const user = new MoodleUser;
    try {
      const profile = await user.wsfunction.core_webservice_get_site_info();
      displayProfile(profile);
    }
    catch (error) {
      console.error('Failed to get profile info:', error);
    }
    try {
      const courses = await user.wsfunction.core_course_get_enrolled_courses_by_timeline_classification();
      console.log(courses);
      displayCourses(courses.courses);
    }
    catch (error) {
      console.error('Failed to get enrolled courses:', error);
    }
  }
  
  function displayCourses(courses) {
    courses.forEach(course => {
      $("#schedule").append($(`<div id="${course.id}">`).append(`<h3>${course.fullnamedisplay}</h3><p>${new Date(course.startdate * 1000).toUTCString()} - ${new Date(course.enddate * 1000).toUTCString()}</p>`));
    });
  }
  function displayProfile(profile) {
    console.log(profile);
    $("#navbar").append($(`<div id="user_profile">`).append(`<p> Welcome back ${profile.fullname}</p><img src="${profile.userpictureurl}" alt="Profile pic">`));
  }

  applyTheme();
  scheduleInitialization();  