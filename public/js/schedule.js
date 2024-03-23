import {applyTheme} from './script.js';

let token = sessionStorage.getItem("token");

class MoodleUser {
    constructor() {
      this.wsfunction = new WSfunction();
    }
    async getECTS(link) {
      try {
        const response = await fetch(`http://localhost:3000/webscraper?link=${link}`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        const data = await response.text(); // Extracting response body as text
        console.log('Data from server:', data);
        return data; // Returning the data received from the server
      } 
      catch (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
      }
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
    async core_course_get_contents(course_id) {
      try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=core_course_get_contents&courseid=${course_id}`);
        if (!response.ok) {
          throw new Error('Network response error');
        }
        return response.json();
      } 
      catch (error) {
        console.error('Error fetching course contents:', error);
        throw error;
      }
    }
    async mod_page_get_pages_by_courses(course_id) {
      try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=mod_page_get_pages_by_courses&courseid=${course_id}`);
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
}

  async function scheduleInitialization() {
    const user = new MoodleUser;
    let courses = {};
    try {
      const profile = await user.wsfunction.core_webservice_get_site_info();
      displayProfile(profile);
    }
    catch (error) {
      console.error('Failed to get profile info:', error);
    }
    try {
      const coursesresponse = await user.wsfunction.core_course_get_enrolled_courses_by_timeline_classification();
      courses = coursesresponse.courses;
      console.log(courses);
      courses = courses.filter(course => course.enddate !== 2527282800); // Hard code filter out standard enrolled courses by common enddate, not pretty but functional
      console.log(courses);
      courses.forEach(async course => {
        course.contents = await user.wsfunction.core_course_get_contents(course.id);
        course.pages = await user.wsfunction.mod_page_get_pages_by_courses(course.id);
        course.modulelink = await findModulelink(course);
        if (course.modulelink) course.ECTS = await user.getECTS(course.modulelink);
      });
      console.log(courses);
      displayCourses(courses);
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
  async function findModulelink(course) {
    const regex = /https:\/\/moduler\.aau\.dk\/course\/([^?]+)/;
    
    let linkPart = null;

    course.pages.pages.forEach(page => {
        const content = page.content;
        const match = regex.exec(content);
        if (match && match[1]) {
            linkPart = match[1];
            return;
        }
    });

    return linkPart !== null ? `https://moduler.aau.dk/course/${linkPart}?lang=en-GB` : undefined;
}
  applyTheme();
  scheduleInitialization();  