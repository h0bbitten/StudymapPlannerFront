import {applyTheme} from './script.js';

let token = sessionStorage.getItem("token");

class MoodleUser {
    constructor() {
      this.wsfunction = new WSfunction();
    }
    async getECTS(link) {
      try {
        const response = await fetch(`http://localhost:4000/webscraper?link=${link}`);
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
        const response = await fetch(`http://localhost:4000/MoodleAPI?token=${token}&wsfunction=core_course_get_enrolled_courses_by_timeline_classification`);
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
        const response = await fetch(`http://localhost:4000/MoodleAPI?token=${token}&wsfunction=core_webservice_get_site_info`);
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
        const response = await fetch(`http://localhost:4000/MoodleAPI?token=${token}&wsfunction=core_course_get_contents&courseid=${course_id}`);
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
        const response = await fetch(`http://localhost:4000/MoodleAPI?token=${token}&wsfunction=mod_page_get_pages_by_courses&courseid=${course_id}`);
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
    const lectureNamesContainer = $('.lectureNames');
    lectureNamesContainer.empty();x
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

              // Create a dropdown for each course
      const courseDropdown = $(`<select class="course-dropdown" name="course_${course.id}"></select>`);
      courseDropdown.append(`<option value="">Se lectures her</option>`);
      
      for (const lecture of course.contents) {
        courseDropdown.append(`<option value="${lecture.id}">${lecture.name}</option>`);
      }
      
      // Append the dropdown to the container in schedule.html. The container is a div with the class "lectureNames"
      lectureNamesContainer.append(`<div class="course-dropdown-container"><label>${course.fullname}</label></div>`);
      lectureNamesContainer.find('.course-dropdown-container:last').append(courseDropdown);
      });
      console.log(courses);
      displayCourses(courses);
    }
    catch (error) {
      console.error('Failed to get enrolled courses:', error);
    }
    
  }
  function displayCourses(courses) {
    courses.forEach(course => { // Loop over each course
      // Make sure the course has a dayOfWeek and timeSlot property before proceeding
      if (course.dayOfWeek && course.timeSlot) {
        const dayColumn = $(`.day[data-day="${course.dayOfWeek.toLowerCase()}"]`).closest('.part_day');
        const timeSlot = dayColumn.find(`.task[data-time="${course.timeSlot}"]`);
        
        // Check if the timeSlot element exists before trying to append to it
        if (timeSlot.length > 0) {
          const courseElement = $(`<div class="course-detail">`).append(`<h4>${course.fullnamedisplay}</h4><p>${course.ECTS} ECTS</p>`);
          timeSlot.append(courseElement);
        }
      }
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