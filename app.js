export {getMoodleInfo, testToken, saveOptions, getUserData};
import {Webscraper} from "./scraping.js";
import axios from 'axios';
import fs from 'fs';
import { ensureUserExists } from './database.js';


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
async function testToken(req, res) {
  let token = req.query.token;
  let test = new WSfunctions(token)
  let validity = "";
  try {
    let tokenTry = await test.core_webservice_get_site_info();
    if (tokenTry.errorcode === 'invalidtoken') {
      validity = "Invalid Token";
    }
    else {
      req.session.token = token;
      req.session.loggedIn = true;
      validity = "Valid Token";
    }
    console.log(validity);
    res.send(validity);
  }
  catch (error) {
    console.error('Failed to test token:', error);
  }
}
async function getMoodleInfo(req, res) {
  try {
    let token = req.session.token;
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
        course.color = await assignColor(course.id);
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
async function saveOptions(req, res) {
  try {
    console.log('Saving options');
    let user = req.body;

    const useridInt = parseInt(req.body.userid, 10);
    if (isNaN(useridInt)) {
    return res.status(400).send("userid must be an integer");
}
    console.log(`Parsed userid: ${useridInt}`);

    // Ensure user exists in the database or insert them
    const userId = await ensureUserExists(user.userid);

    // Continue with filesystem saving as before
    fs.writeFile(`./database/${user.userid}.json`, JSON.stringify(user), (err) => {
      if (err) {
        console.error('Error saving user data:', err);
        res.status(500).send('Error saving user data');
      } else {
        console.log('User data saved successfully');
        res.status(200).send('User data saved successfully');
      }
    });
  } catch (err) {
    console.error('Error in saveOptions:', err);
    res.status(500).send('Internal Server Error');
  }
}


async function getUserData(req, res) {
  try {
    let user = await retrieveAndParseUserdData(req.query.userid);
    res.send(user);
  } catch (error) {
    console.error('Failed to get user data:', error);
    res.status(500).send('Internal Server Error');
  }

}
function retrieveAndParseUserdData(userid){
  return new Promise((resolve, reject) => {
    fs.readFile(`./database/${userid}.json`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}
const colors = [
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#800000", // Maroon
  "#008000", // Green
  "#000080", // Navy
  "#808000", // Olive
  "#800080", // Purple
  "#008080", // Teal
  "#C0C0C0", // Silver
  "#808080", // Gray
  "#FFA500", // Orange
  "#A52A2A", // Brown
  "#800000", // Maroon
  "#FF4500", // OrangeRed
  "#D2691E", // Chocolate
  "#FF8C00", // DarkOrange
  "#FF7F50", // Coral
  "#DC143C", // Crimson
  "#FF6347", // Tomato
  "#FFD700", // Gold
  "#B8860B", // DarkGoldenRod
  "#DAA520", // GoldenRod
  "#FF69B4", // HotPink
  "#FF1493", // DeepPink
  "#C71585", // MediumVioletRed
  "#DB7093", // PaleVioletRed
  "#00BFFF", // DeepSkyBlue
  "#87CEEB", // SkyBlue
  "#4682B4", // SteelBlue
  "#B0C4DE", // LightSteelBlue
  "#ADD8E6", // LightBlue
  "#B0E0E6", // PowderBlue
  "#AFEEEE", // PaleTurquoise
  "#00CED1", // DarkTurquoise
  "#48D1CC", // MediumTurquoise
  "#40E0D0", // Turquoise
  "#00FFFF", // Aqua
  "#00FFFF", // Cyan
  "#5F9EA0", // CadetBlue
  "#66CDAA", // MediumAquaMarine
  "#7FFFD4", // Aquamarine
  "#7FFFD4", // AquaMarine
  "#8A2BE2", // BlueViolet
  "#9932CC", // DarkOrchid
  "#8B008B", // DarkMagenta
  "#9400D3", // DarkViolet
  "#800080", // Purple
  "#BA55D3", // MediumOrchid
  "#9370DB", // MediumPurple
  "#663399", // RebeccaPurple
  "#4B0082", // Indigo
  "#7B68EE", // MediumSlateBlue
  "#6A5ACD", // SlateBlue
  "#483D8B", // DarkSlateBlue
  "#E6E6FA", // Lavender
  "#D8BFD8", // Thistle
  "#DDA0DD", // Plum
  "#DA70D6", // Orchid
  "#FF00FF", // Magenta
  "#FF00FF", // Fuchsia
  "#FFC0CB", // Pink
  "#FFB6C1", // LightPink
  "#FA8072", // Salmon
  "#FFA07A", // LightSalmon
  "#FF7F50", // Coral
  "#FF4500", // OrangeRed
  "#FF6347", // Tomato
  "#FF8C00", // DarkOrange
  "#FFA500", // Orange
  "#FFD700", // Gold
  "#FFFF00", // Yellow
  "#FFFFE0", // LightYellow
  "#FFFACD", // LemonChiffon
  "#FAFAD2", // LightGoldenRodYellow
  "#FFEFD5", // PapayaWhip
  "#FFE4B5", // Moccasin
  "#FFDAB9", // PeachPuff
  "#EEE8AA", // PaleGoldenRod
  "#F0E68C", // Khaki
  "#BDB76B", // DarkKhaki
  "#F5DEB3", // Wheat
  "#DEB887", // BurlyWood
  "#D2B48C", // Tan
  "#BC8F8F", // RosyBrown
  "#F4A460", // SandyBrown
  "#D2691E", // Chocolate
  "#CD853F", // Peru
  "#8B4513", // SaddleBrown
  "#A0522D", // Sienna
  "#A52A2A", // Brown
  "#800000", // Maroon
  "#000000", // Black
  "#2F4F4F", // DarkSlateGray
  "#696969", // DimGray
  "#708090", // SlateGray
  "#778899", // LightSlateGray
  "#808080", // Gray
  "#A9A9A9", // DarkGray
  "#C0C0C0", // Silver
  "#D3D3D3", // LightGray
  "#FFFFFF"  // White
];

async function assignColor(integer){
  return new Promise((resolve, reject) => {
    if (Number.isInteger(integer) && integer > 0) {
        let index = integer % colors.length;
        let color = colors[index];

        colors.splice(index, 1);

        resolve(color);
    } else {
        reject(new Error("Input must be a positive integer"));
    }
});}

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



