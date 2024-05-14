import fs, { write } from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import Webscraper from './scraping.js';
import calculateSchedule from './Algorithm.js';

export {
  getMoodleInfo, logIn, saveOptions, getUserData, getSchedule, importIcalFile, changeLectureChosen, deleteAllUserData,
};

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);

class WSfunctions {
  constructor(token) {
    this.token = token;
    this.urlStart = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${this.token}&moodlewsrestformat=json&wsfunction=`;
  }

  static async getMoodleData(url, errorCallback) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response error');
      }
      return response.json();
    } catch (error) {
      console.error(errorCallback, error);
      throw error;
    }
  }

  async core_course_get_enrolled_courses_by_timeline_classification() {
    const url = `${this.urlStart}core_course_get_enrolled_courses_by_timeline_classification&classification=inprogress`;
    return WSfunctions.getMoodleData(url, 'Error fetching enrolled courses:');
  }

  async core_webservice_get_site_info() {
    const url = `${this.urlStart}core_webservice_get_site_info`;
    return WSfunctions.getMoodleData(url, 'Error fetching User info:');
  }

  async core_course_get_contents(courseID) {
    const url = `${this.urlStart}core_course_get_contents&courseid=${courseID}`;
    return WSfunctions.getMoodleData(url, 'Error fetching course contents:');
  }

  async mod_page_get_pages_by_courses(courseID) {
    const url = `${this.urlStart}mod_page_get_pages_by_courses&courseids[0]=${courseID}`;
    return WSfunctions.getMoodleData(url, 'Error fetching course pages:');
  }
}
async function logIn(req, res) {
  const test = new WSfunctions(req.query.token);
  const answer = {};
  try {
    const tokenTry = await test.core_webservice_get_site_info();
    if (tokenTry.errorcode === 'invalidtoken') {
      answer.validity = 'Invalid Token';
    } else {
      req.session.token = req.query.token;
      req.session.userid = tokenTry.userid;
      req.session.fullname = tokenTry.fullname;
      req.session.userpictureurl = tokenTry.userpictureurl;
      req.session.loggedIn = true;

      answer.validity = 'Valid Token';

      try {
        const User = await retrieveAndParseUserData(req.session.userid);
        answer.redirect = User.settings.setupDone === true ? 'schedule' : 'setup';
      } catch (error) {
        console.log('User not found, redirecting to setup');
        answer.redirect = 'setup';
      }
    }
    console.log('answer is:', answer);
    res.send(JSON.stringify(answer));
  } catch (error) {
    console.error('Failed loggin in:', error);
  }
}
async function getMoodleInfo(req, res) {
  try {
    const token = req.session.token;
    const Moodle = new WSfunctions(token);
    let user = {};

    try {
      const webserviceResponse = await Moodle.core_webservice_get_site_info();
      user = {
        userid: webserviceResponse.userid,
        fullname: webserviceResponse.fullname,
        userpictureurl: webserviceResponse.userpictureurl,
        sitename: webserviceResponse.sitename,
        siteurl: webserviceResponse.siteurl,
        lang: webserviceResponse.lang,
        courses: [],
      };

      const courseresponse = await Moodle.core_course_get_enrolled_courses_by_timeline_classification();
      user.courses = courseresponse.courses.filter((course) => course.enddate !== 2527282800);

      user.courses = await scrapeModuleLinks(user.courses, Moodle);
    } catch (error) {
      console.error('Failed to get enrolled courses:', error);
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(`Error getting Moodle info: ${error}`);
  }
}

async function scrapeModuleLinks(courses, Moodle) {
  const enrichedCourses = courses.map(async (course) => {
    const contents = await Moodle.core_course_get_contents(course.id);
    const pages = await Moodle.mod_page_get_pages_by_courses(course.id);
    const color = await assignColor(course.id);

    // Check if pages.pages exists and is iterable
    let modulelink;
    if (pages && pages.pages && Array.isArray(pages.pages)) {
      modulelink = await findModulelink(pages.pages);
    } else {
      console.error('Pages structure not as expected:', pages);
    }

    let ECTS = undefined;
    if (modulelink) {
      ECTS = await Webscraper(modulelink);
    }

    return {
      ...course, contents, pages: pages.pages, color, modulelink, ECTS
    };
  });

  return Promise.all(enrichedCourses);
}

async function saveOptions(req, res) {
  try {
    console.log('Saving options');
    const User = req.body;  // The entire user object received from the frontend

    // Filter out calendars marked for removal and delete corresponding files if necessary
    User.settings.importedCalendars = User.settings.importedCalendars.filter(calendar => {
      if (calendar.type === 'remove') {
        const id = req.session.userid;  // Assuming the user's ID is stored in the session
        const parentDir = path.resolve(currentDir, '..');
        const filePath = path.join(parentDir, 'database', 'icals', id.toString(), calendar.name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`File ${calendar.name} removed successfully`);
          return false;  // Do not include this calendar in the updated settings
        }
        console.log(`File ${calendar.name} does not exist`);
      }
      return true;  // Include this calendar in the updated settings
    });

    // Confirm user existence and update details
    const userId = await ensureUserExists(User.userid);
    const updateResult = await saveUserDetails(userId, User);

    if (updateResult) {
      console.log('User data updated successfully in MySQL');
      res.status(200).send('User data saved successfully');
    } else {
      console.log('Failed to update user data');
      res.status(500).send('Error saving User data');
    }
  } catch (err) {
    console.error('Error in saveOptions:', err);
    res.status(500).send('Internal Server Error');
  }
}


const writeFileAsync = fs.promises.writeFile;

async function writeUserToDB(User) {
  try {
    const userId = await ensureUserExists(User.userid);  // Confirm user existence
    await saveUserDetails(userId, User);  // Save full user object
    console.log('User data updated successfully in MySQL');
  } catch (err) {
    console.error('Error updating User data:', err);
    throw err;  // Ensure exceptions are thrown to be caught by caller
  }
}

async function getSchedule(req, res) {
  try {
    const userId = req.session.userid;
    console.log(`Fetching user data for user ID: ${userId}`);
    const User = await retrieveAndParseUserData(userId);
    const requestedAlgorithm = req.query.algorithm;
    const forceRecalculate = req.query.forcerecalculate === 'true';
    const currentAlgorithm = User.schedule.algorithm;

    // Determine if we need to recalculate the schedule
    let recalculate = forceRecalculate || User.schedule.outDated || requestedAlgorithm !== currentAlgorithm;
    console.log(`Recalculate: ${recalculate}, Force: ${forceRecalculate}, Outdated: ${User.schedule.outDated}, Algorithm change: ${requestedAlgorithm !== currentAlgorithm}`);

    if (recalculate) {
      console.log('Recalculating schedule');
      Schedule = await calculateSchedule(User, algorithm);
    } else if (!Schedule.error) {
      console.log('Using cached schedule');
      console.log('Updating chosen value for lectures based on time');
      [Schedule, User.courses] = checkIfLecturesDone(Schedule, User.courses);
    }
    User.schedule = Schedule;
    writeUserToDB(User);
    res.send(JSON.stringify(Schedule));
  } catch (error) {
    console.error('Failed to calculate schedule---------------------------------------------:', error);
    res.status(500).send('Internal Server Error');
  }
}

/* const testUser = {
  courses: [{
    id: 333,
    fullname: 'Test Course',
    contents: [{
      id: 321,
      name: 'Test Lecture',
      chosen: true,
    }, {
      id: 322,
      name: 'Test Lecture 2',
      chosen: true,
    }],
  }, {
    id: 444,
    fullname: 'Test Course 2',
    contents: [{
      id: 421,
      name: 'Test Lecture 3',
      chosen: true,
    }, {
      id: 422,
      name: 'Test Lecture 4',
      chosen: true,
    }],
  }],
};

let testSchedule = {
  Timeblocks: [{
    type: 'lecture',
    courseID: 333,
    ID: 321,
    startTime: 1620000000000,
    endTime: 1620003600000,
    description: 'Test Lecture 1',
    status: 'active',
  }, {
    type: 'lecture',
    courseID: 333,
    ID: 322,
    startTime: 1620007200000,
    endTime: 1715626742000,
    description: 'Test Lecture 2',
    status: 'active',
  }, {
    type: 'lecture',
    courseID: 444,
    ID: 421,
    startTime: 1620000000000,
    endTime: 1620003600000,
    description: 'Test Lecture 3',
    status: 'active',
  }, {
    type: 'lecture',
    courseID: 444,
    ID: 422,
    startTime: 1620007200000,
    endTime: 1715626742000,
    description: 'Test Lecture 4',
    status: 'active',
  }],
};

console.log('Test user before:');
testUser.courses.forEach((course) => {
  course.contents.forEach((lecture) => {
    console.log(lecture.name, lecture.id, 'is chosen', lecture.chosen);
  });
});
console.log('Test schedule before:');
testSchedule.Timeblocks.forEach((timeblock) => {
  console.log(timeblock.description, timeblock.ID, 'status is:', timeblock.status);
});
[testSchedule, testUser.courses] = checkIfLecturesDone(testSchedule, testUser.courses);
console.log('Test user after:');
testUser.courses.forEach((course) => {
  course.contents.forEach((lecture) => {
    console.log(lecture.name, lecture.id, 'is chosen', lecture.chosen);
  });
});
console.log('Test schedule after:');
testSchedule.Timeblocks.forEach((timeblock) => {
  console.log(timeblock.description, timeblock.ID, 'status is:', timeblock.status);
});
 */
function checkIfLecturesDone(Schedule, courses) {
  const currentTimeMillis = new Date().getTime();
  Schedule.Timeblocks.forEach((timeblock) => {
    if (timeblock.type === 'lecture' && currentTimeMillis > timeblock.endTime) {
      // Uncheck the lecture
      changeLectureChosenStatus(courses, timeblock.courseID, timeblock.ID, false);
      timeblock.status = 'done';
    }
  });
  return [Schedule, courses];
}

function changeLectureChosenStatus(courses, courseID, lectureID, chosen) {
  courses.forEach((course) => {
    if (course.id === courseID) {
      course.contents.forEach((lecture) => {
        if (lecture.id === lectureID) {
          lecture.chosen = chosen;
        }
      });
    }
  });
}

function retrieveAndParseUserData(userid) {
  return new Promise((resolve, reject) => {
    fs.readFile(`./database/${userid}.json`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
      console.log("Retrieved and parsed user data including schedule:", userData);
      return userData;
    } else {
      console.log("No user found with userID:", userid);
      throw new Error('No user found with the given ID');
    }
  } catch (error) {
    console.error('Failed to retrieve or parse user data from database:', error);
    throw error;
  }
}


async function getUserData(req, res) {
  try {
    const User = await retrieveAndParseUserData(req.session.userid);
    res.send(User);
  } catch (error) {
    console.error('Failed to get User data:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function findModulelink(pages) {
  const regex = /https:\/\/moduler\.aau\.dk\/course\/([^?]+)/;

  let linkPart = null;

  pages.forEach((page) => {
    const { content } = page;
    const match = regex.exec(content);
    if (match) {
      const [, linkPartMatch] = match;
      linkPart = linkPartMatch;
    }
  });

  return linkPart !== null ? `https://moduler.aau.dk/course/${linkPart}?lang=en-GB` : undefined;
}

const colors = [
  '#FF0000', // Red
  '#00FF00', // Lime
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#800000', // Maroon
  '#008000', // Green
  '#000080', // Navy
  '#808000', // Olive
  '#800080', // Purple
  '#008080', // Teal
  '#C0C0C0', // Silver
  '#808080', // Gray
  '#FFA500', // Orange
  '#A52A2A', // Brown
  '#800000', // Maroon
  '#FF4500', // OrangeRed
  '#D2691E', // Chocolate
  '#FF8C00', // DarkOrange
  '#FF7F50', // Coral
  '#DC143C', // Crimson
  '#FF6347', // Tomato
  '#FFD700', // Gold
  '#B8860B', // DarkGoldenRod
  '#DAA520', // GoldenRod
  '#FF69B4', // HotPink
  '#FF1493', // DeepPink
  '#C71585', // MediumVioletRed
  '#DB7093', // PaleVioletRed
  '#00BFFF', // DeepSkyBlue
  '#87CEEB', // SkyBlue
  '#4682B4', // SteelBlue
  '#B0C4DE', // LightSteelBlue
  '#ADD8E6', // LightBlue
  '#B0E0E6', // PowderBlue
  '#AFEEEE', // PaleTurquoise
  '#00CED1', // DarkTurquoise
  '#48D1CC', // MediumTurquoise
  '#40E0D0', // Turquoise
  '#00FFFF', // Aqua
  '#00FFFF', // Cyan
  '#5F9EA0', // CadetBlue
  '#66CDAA', // MediumAquaMarine
  '#7FFFD4', // Aquamarine
  '#7FFFD4', // AquaMarine
  '#8A2BE2', // BlueViolet
  '#9932CC', // DarkOrchid
  '#8B008B', // DarkMagenta
  '#9400D3', // DarkViolet
  '#800080', // Purple
  '#BA55D3', // MediumOrchid
  '#9370DB', // MediumPurple
  '#663399', // RebeccaPurple
  '#4B0082', // Indigo
  '#7B68EE', // MediumSlateBlue
  '#6A5ACD', // SlateBlue
  '#483D8B', // DarkSlateBlue
  '#E6E6FA', // Lavender
  '#D8BFD8', // Thistle
  '#DDA0DD', // Plum
  '#DA70D6', // Orchid
  '#FF00FF', // Magenta
  '#FF00FF', // Fuchsia
  '#FFC0CB', // Pink
  '#FFB6C1', // LightPink
  '#FA8072', // Salmon
  '#FFA07A', // LightSalmon
  '#FF7F50', // Coral
  '#FF4500', // OrangeRed
  '#FF6347', // Tomato
  '#FF8C00', // DarkOrange
  '#FFA500', // Orange
  '#FFD700', // Gold
  '#FFFF00', // Yellow
  '#FFFFE0', // LightYellow
  '#FFFACD', // LemonChiffon
  '#FAFAD2', // LightGoldenRodYellow
  '#FFEFD5', // PapayaWhip
  '#FFE4B5', // Moccasin
  '#FFDAB9', // PeachPuff
  '#EEE8AA', // PaleGoldenRod
  '#F0E68C', // Khaki
  '#BDB76B', // DarkKhaki
  '#F5DEB3', // Wheat
  '#DEB887', // BurlyWood
  '#D2B48C', // Tan
  '#BC8F8F', // RosyBrown
  '#F4A460', // SandyBrown
  '#D2691E', // Chocolate
  '#CD853F', // Peru
  '#8B4513', // SaddleBrown
  '#A0522D', // Sienna
  '#A52A2A', // Brown
  '#800000', // Maroon
  '#000000', // Black
  '#2F4F4F', // DarkSlateGray
  '#696969', // DimGray
  '#708090', // SlateGray
  '#778899', // LightSlateGray
  '#808080', // Gray
  '#A9A9A9', // DarkGray
  '#C0C0C0', // Silver
  '#D3D3D3', // LightGray
  '#FFFFFF', // White
];

async function assignColor(integer) {
  return new Promise((resolve, reject) => {
    if (Number.isInteger(integer) && integer > 0) {
      const index = integer % colors.length;
      const color = colors[index];

      colors.splice(index, 1);

      resolve(color);
    } else {
      reject(new Error('Input must be a positive integer'));
    }
  });
}

async function importIcalFile(req, res) {
  try {
    const { files } = req;
    const id = req.session.userid;
    const parentDir = path.resolve(currentDir, '..');
    const directory = path.join(parentDir, 'database', 'icals', id.toString());
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file.originalname);
      fs.renameSync(file.path, filePath);
    });

    res.status(200).send('Files uploaded successfully.');
  } catch (error) {
    console.error('Failed to import ICAL file:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function changeLectureChosen(req, res) {
  try {
    const courseID = Number(req.query.courseID);
    const lectureID = Number(req.query.lectureID);
    const chosen = req.query.chosen === 'true';
    console.log('Changing lecture chosen status', courseID, lectureID, chosen);
    const User = await retrieveAndParseUserData(req.session.userid);
    changeLectureChosenStatus(User.courses, courseID, lectureID, chosen);
    await writeUserToDB(User);
    res.status(200).json({
      success: true,
      message: 'Lecture chosen status changed successfully',
      lectureID: lectureID,
      courseID: courseID,
      chosen: chosen,
    });
  } catch (error) {
    console.error('Failed to change lecture chosen status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
}

async function deleteAllUserData(req, res) {
  try {
    const userDataDirectory = `./database/${req.session.userid}.json`;
    fs.unlinkSync(userDataDirectory);
    const icalsDirectory = `./database/icals/${req.session.userid}`;
    fs.rmSync(icalsDirectory, { recursive: true });
    res.status(200).send('User data deleted successfully');
  } catch (error) {
    console.error('Failed to delete user data:', error);
    res.status(500).send('Internal Server Error');
  }
}
