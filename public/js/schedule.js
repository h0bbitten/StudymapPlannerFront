import {applyTheme} from './script.js'; // Henter applyTheme fra script.js

let token = sessionStorage.getItem("token"); // Henter token fra sessionStorage. Det vil sige, at vi tjekker om brugeren er logget ind. Hvis brugeren er logget ind, så vil token være sat, og vi kan derfor hente token fra sessionStorage. Hvis brugeren ikke er logget ind, så vil token være null, og vi kan derfor ikke hente token fra sessionStorage.

class MoodleUser { // Klasse til at hente data fra Moodle API.
    constructor() { // Konstruktør til at initialisere objektet.
      this.wsfunction = new WSfunction(); // Opretter et nyt objekt af klassen WSfunction. WSfunction betyder WebService function. Dette objekt indeholder metoder til at hente data fra Moodle API.
    }
    async getECTS(link) { // Metode til at hente ECTS point fra en given link.
      try { //Vi starter en try-catch blok. Try-catch blokken bruges til at håndtere fejl. Hvis der opstår en fejl i try blokken, så vil catch blokken blive kørt.
        const response = await fetch(`http://localhost:3000/webscraper?link=${link}`); // Vi bruger fetch til at hente data fra vores server. Vi sender linket som parameter til vores server. Vi bruger await, så vi venter på at fetch er færdig, før vi fortsætter. linket er linket til moduler.aau.dk.
        if (!response.ok) { // Hvis response.ok er false, så vil vi kaste en fejl. Dette betyder, at der er sket en fejl i fetch kaldet.
          throw new Error('Network response error'); // Vi kaster en fejl med beskeden 'Network response error'.
        }
        const data = await response.text(); // Vi henter data fra response. Vi bruger await, så vi venter på at data er hentet, før vi fortsætter. Vi bruger text metoden, da vi forventer at få en tekststreng tilbage.
        console.log('Data from server:', data); // Vi logger dataen, som vi har fået fra serveren.
        return data; // Vi returnerer dataen, som vi har fået fra serveren.
      } 
      catch (error) { // Hvis der er sket en fejl i try blokken, så vil catch blokken blive kørt. Fejlen vil blive gemt i variablen error.
        console.error('Error fetching enrolled courses:', error); // Vi logger fejlen, som vi har fået i catch blokken.
        throw error; // Vi kaster fejlen videre, så den kan blive håndteret et andet sted.
      }
    }
} 
 
// Klasse til at hente data fra Moodle API. Vi henter kuser, brugerens information og indholdet af hvert tilmeldt kursus.
class WSfunction { 
    constructor() {}
    // Funktionen nedenunder henter kurser, som brugeren er tilmeldt. Funktionen returnerer et JSON objekt med information om kurserne.
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
    // Funktionen nedenunder henter brugerens information. Funktionen returnerer et JSON objekt med information om brugeren.
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
    // Funktionen nedenunder henter indholdet af hvert tilmeldt kursus. Funktionen returnerer et JSON objekt med indholdet af et kursus.
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
    // Funktionen nedenunder henter siderne af et kursus. Funktionen returnerer et JSON objekt med siderne af et kursus.
    async mod_page_get_pages_by_courses(course_id) { // Metode til at hente siderne af et kursus. mod_page_get_pages_by_courses er en metode fra Moodle API.
      try {
        const response = await fetch(`http://localhost:3000/MoodleAPI?token=${token}&wsfunction=mod_page_get_pages_by_courses&courseid=${course_id}`); // Vi bruger fetch til at hente data fra vores server. Vi sender token, wsfunction og courseid som parameter til vores server. Vi bruger await, så vi venter på at fetch er færdig, før vi fortsætter.
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

// Funktion til at initialisere schedule siden. Funktionen henter brugerens information, kurserne som brugeren er tilmeldt og indholdet af hvert tilmeldt kursus.
async function scheduleInitialization() { 
  const lectureNamesContainer = $('.lectureNames'); // Vi henter elementet med klassen "lectureNames" fra schedule.html og gemmer det i variablen lectureNamesContainer.
  lectureNamesContainer.empty(); // Vi sikre os, at lectureNamesContainer er tomt.
  const user = new MoodleUser; // Vi opretter et nyt objekt af klassen MoodleUser. Dette objekt indeholder metoder til at hente data fra Moodle API.
  let courses = {}; // Vi initialiserer variablen courses som et tomt objekt som vi skal bruge til at gemme kurserne, som brugeren er tilmeldt.
  try {
    const profile = await user.wsfunction.core_webservice_get_site_info(); // Vi henter brugerens information ved at kalde metoden core_webservice_get_site_info fra objektet user. Vi bruger await, så vi venter på at metoden er færdig, før vi fortsætter. Vi gemmer brugerens information i variablen profile.
    displayProfile(profile); // Vi kalder funktionen displayProfile med brugerens information som parameter. Funktionen displayProfile viser brugerens information på siden.
  } catch (error) {
    console.error('Failed to get profile info:', error);
  }
  try {
    const coursesresponse = await user.wsfunction.core_course_get_enrolled_courses_by_timeline_classification(); // Vi henter kurserne, som brugeren er tilmeldt ved at kalde metoden core_course_get_enrolled_courses_by_timeline_classification fra objektet user. Vi bruger await, så vi venter på at metoden er færdig, før vi fortsætter. Vi gemmer kurserne i variablen coursesresponse.
    courses = coursesresponse.courses; // Vi gemmer kurserne fra coursesresponse i variablen courses. ".courses" er nødvendigt, da coursesresponse er et objekt, som indeholder kurserne.
    console.log(courses); // Vi logger kurserne, som brugeren er tilmeldt.
    // Filter out standard enrolled courses by common enddate
    courses = courses.filter(course => course.enddate !== 2527282800); // Vi filtrerer kurserne, som brugeren er tilmeldt. Vi filtrerer kurserne, så vi kun får kurser, som ikke har en slutdato på 2527282800. Dette er for at fjerne standard kurserne, som brugeren er tilmeldt.
    console.log(courses);
    
    // for (const course of courses) { // Vi laver et for-loop, som kører igennem hvert kursus, som brugeren er tilmeldt.
    for (const course of courses) { 
      course.contents = await user.wsfunction.core_course_get_contents(course.id);
      course.pages = await user.wsfunction.mod_page_get_pages_by_courses(course.id);

      // Laver dropdown for hver kursus.
      const courseDropdown = $(`<select class="course-dropdown" name="course_${course.id}"></select>`);
      courseDropdown.append(`<option value="">Vælg en forelæsning</option>`); // Sætter en slags placeholder i dropdownen.
      
      // for (const lecture of course.contents) { // Vi laver et for-loop, som kører igennem hvert indhold af et kursus.
      for (const lecture of course.contents) {
        courseDropdown.append(`<option value="${lecture.id}">${lecture.name}</option>`); // Vi tilføjer en option til dropdownen for hvert indhold af et kursus. Det vil sige for hver lecture.
      }
      
      // Her tilføjer vi alle dropdown til lectureNamesContainer som er initialiseret i starten af funktionen.
      lectureNamesContainer.append(`<div class="course-dropdown-container"><label>${course.fullname}</label></div>`);
      lectureNamesContainer.find('.course-dropdown-container:last').append(courseDropdown); 
    }
    console.log(courses);
    displayCourses(courses);
  } catch (error) {
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