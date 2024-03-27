export {MoodleAPI, getMoodleInfo};
import {Webscraper} from "./scraping.js";
import axios from 'axios';

class WSfunctions {
  constructor(token) {
    this.token = token;
  }

  async core_course_get_enrolled_courses_by_timeline_classification() {
    try {
      const response = await fetch(`https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${this.token}&moodlewsrestformat=json&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&classification=inprogress`);
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
      const response = await fetch(`https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${this.token}&moodlewsrestformat=json&wsfunction=core_webservice_get_site_info`);
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
      const response = await fetch(`https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${this.token}&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=${course_id}`);
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
      const response = await fetch(`https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${this.token}&moodlewsrestformat=json&wsfunction=mod_page_get_pages_by_courses&courseids[0]=${course_id}`);
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
async function MoodleAPI(req, res) {
    try {
        const token = req.query.token;
        const method = req.query.wsfunction;
        const courseid = req.query.courseid;
        let url = '';
        switch (method) {
          case 'core_course_get_enrolled_courses_by_timeline_classification':
            url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}&classification=inprogress`;
            break;
          case 'core_webservice_get_site_info':
            url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}`;
            break;
          case 'core_course_get_contents':
            url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}&courseid=${courseid}`;
            break;
          case 'mod_page_get_pages_by_courses':
            url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}&courseids[0]=${courseid}`;
            break;
          case 'core_calendar_get_calendar_events':
            url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}`
            break;  
          default:
            break;
        }
        //console.log('\n',`Called MoodleApi method: `,method,'\n', url,'\n');
        const response = await axios.get(url);
        res.send(response.data);
      }
      catch (error) {
        res.status(500).send(`Error fetching method: ${error}`);
      }
}
async function getMoodleInfo(req, res) {
  try {
    const token = req.query.token;
    let Moodle = new WSfunctions(token);
    let user = {};
    try {
      user = await Moodle.core_webservice_get_site_info();
      let courseresponse = await Moodle.core_course_get_enrolled_courses_by_timeline_classification();
      user.courses = courseresponse.courses;
      user.courses = user.courses.filter(course => course.enddate !== 2527282800); // We should come up with better filtering system, maybe on clint side, but works for now

      let coursePromises = user.courses.map(async course => {
        course.contents = await Moodle.core_course_get_contents(course.id);
        course.pages = await Moodle.mod_page_get_pages_by_courses(course.id);
        course.modulelink = await findModulelink(course);
        if (course.modulelink) course.ECTS = await Webscraper(course.modulelink);
      });

      await Promise.all(coursePromises);
    } catch (error) {
      console.error('Failed to get enrolled courses:', error);
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(`Error getting Moodle info: ${error}`);
  }
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
