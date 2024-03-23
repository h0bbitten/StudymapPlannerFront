export {MoodleAPI, ECTSscraper};
import {Webscraper} from "./scraping.js";
import axios from 'axios';

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

async function ECTSscraper(req, res) {
    try {
        const link = req.query.link;
        console.log('\n',`Called Webscraper on: `,link,'\n');
        const ECTS = await Webscraper(link);
        res.send(ECTS.toString());
      }
      catch (error) {
        res.status(500).send(`Error fetching method: ${error}`);
      }
}