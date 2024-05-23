import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import swaggerDocs from './swagger.js';
import {
  getMoodleInfo, logIn, saveOptions, getUserData, getSchedule, importIcalFile, changeLectureChosen, deleteAllUserData, exportIcalSchedule,
} from './app.js';

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const PORT = process.env.PORT || 3000;

const routing = function routes(app, upload) {
  // Swagger setup
  swaggerDocs(app, PORT);

  // Side routes
  app.get('/', async (req, res) => {
    console.log(req.session.loggedIn);
    if (req.session.loggedIn === true) {
      res.redirect('/schedule');
    } else {
      res.redirect('/login');
    }
  });

  app.get('/login', (req, res) => {
    // Send the /html/login.html file when /login is accessed
    res.sendFile(path.join(currentDir, 'public', 'html', 'login.html'));
  });
  app.get('/setup', (req, res) => {
    // Send the /html/setup.html file when /setup is accessed
    if (req.session.loggedIn === true) {
      res.sendFile(path.join(currentDir, 'public', 'html', 'setup.html'));
    } else {
      res.redirect('/login');
    }
  });
  app.get('/schedule', (req, res) => {
    // Send the /html/schedule.html file when /schedule is accessed
    if (req.session.loggedIn === true) {
      res.sendFile(path.join(currentDir, 'public', 'html', 'schedule.html'));
    } else {
      console.log('User is not logged in: ', req.session.loggedIn);
      res.redirect('/login');
    }
  });
  app.get('/settings', (req, res) => {
    // Send the /html/settings.html file when /settings is accessed
    console.log('User is logged in: ', req.session.loggedIn);
    if (req.session.loggedIn === true) {
      res.sendFile(path.join(currentDir, 'public', 'html', 'settings.html'));
    } else {
      res.redirect('/login');
    }
  });
  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(currentDir, '/public/img/favicon.ico'));
  });

  // GET Endpoints
  /**
     * @swagger
     * /getMoodleInfo:
     *   get:
     *     description: Retrieves Moodle information about the logged-in user and their enrolled courses.
     *     responses:
     *       200:
     *         description: Successful response containing user and course information.
     *         content:
     *           application/json:
     *         schema:
     *           type: object
     *           properties:
     *             userid:
     *               type: integer
     *               description: The user's unique ID on the Moodle platform.
     *             fullname:
     *               type: string
     *               description: The user's full name as displayed in Moodle.
     *             userpictureurl:
     *               type: string
     *               description: (optional) The URL to the user's profile picture in Moodle.
     *             sitename:
     *               type: string
     *               description: The name of the Moodle site.
     *             siteurl:
     *               type: string
     *               description: The base URL of the Moodle site.
     *             lang:
     *               type: string
     *               description: The language used in the Moodle site interface.
     *             courses:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: The unique ID of the course on the Moodle platform.
     *                   shortname:
     *                     type: string
     *                     description: The short name of the course as displayed in Moodle.
     *                   fullnamecourse:  # Changed to fullname
     *                     type: string
     *                     description: The full name of the course.
     *                   categoryid:
     *                     type: integer
     *                     description: (optional) The ID of the category the course belongs to (if applicable).
     *                   startdate:
     *                     type: string
     *                     description: The start date of the course in ISO 8601 format.
     *                   visible:
     *                     type: boolean
     *                     description: Whether the course is visible to the user.
     *                   progress:
     *                     type: number
     *                     description: (optional) The user's progress percentage in the course (if available from Moodle webservice).
     *                   moduleLinks:
     *                     type: array
     *                     items:
     *                       type: string
     *                       description: (optional) An array containing links to the user's enrolled modules within the course.
     *             examples:
     *               application/json:
     *                 value:
     *                   userid: 123
     *                   fullname: "John Doe"
     *                   userpictureurl: "https://moodle.org/user123.jpg"
     *                   sitename: "My Moodle Site"
     *                   siteurl: "https://moodle.org"
     *                   lang: "en"
     *                   courses:
     *                     -  # Use a hyphen for the first element in the list
     *                       id: 456
     *                       shortname: "MATH101"
     *                       fullname: "Introduction to Mathematics"  # Corrected property name
     *                       categoryid: 1
     *                       startdate: "2022-01-01T00:00:00Z"
     *                       visible: true
     *                       progress: 50
     *                       moduleLinks:
     *                         - "https://moodle.org/course456/module1"
     *                         - "https://moodle.org/course456/module2"
     *       500:
     *         description: Internal server error occurred during processing.
     */
  app.get('/getMoodleInfo', async (req, res) => {
    await getMoodleInfo(req, res).catch((error) => {
      console.error('Error in getMoodleInfo:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /testToken:
     *   get:
     *     description: Tests user token against Moodle API
     *     responses:
     *       200:
     *         description: Successful response
     *       500:
     *         description: Internal server error
     */
  app.get('/getLogIn', async (req, res) => {
    await logIn(req, res).catch((error) => {
      console.error('Error logging in:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /getUserData:
     *   get:
     *     description: Gets user data from server database
     *     responses:
     *       200:
     *         description: Successful response
     *       500:
     *         description: Internal server error
     */
  app.get('/getUserData', async (req, res) => {
    await getUserData(req, res).catch((error) => {
      console.error('Error in getting user:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /logout:
     *   get:
     *     description: Gets user data from server database
     *     responses:
     *       200:
     *         description: Successful response
     *       500:
     *         description: Internal server error
     */
  app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Internal Server Error');
      }
      return res.redirect('/login');
    });
  });
  /**
     * @swagger
     * /getSchedule:
     *   get:
     *     description: Gets schedule from Moodle server database
     *     responses:
     *       200:
     *         description: Successful response
     *       500:
     *         description: Internal server error
     */
  app.get('/getSchedule', async (req, res) => {
    await getSchedule(req, res).catch((error) => {
      console.error('Error in getting calculating schedule:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /changeLectureChosen:
     *   get:
     *     summary: Changes the chosen status of a lecture
     *     description: Gets schedule from Moodle server database
     *     requestbody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               lectureID:
     *                 type: integer
     *                 description: The unique ID of the lecture to change the chosen status of
     *                 required: true
     *               courseID:
     *                 type: integer
     *                 description: The unique ID of the course the lecture belongs to
     *                 required: true
     *               chosen:
     *                 type: boolean
     *                 description: The new chosen status of the lecture
     *                 required: true
     *     responses:
     *       200:
     *         description: Lecture chosen status changed successfully
     *       500:
     *         description: Internal server error
     */
  app.get('/changeLectureChosen', async (req, res) => {
    await changeLectureChosen(req, res).catch((error) => {
      console.error('Error in changing value of chosen for lecture:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /exportIcalSchedule:
     *   get:
     *     description: Exports the schedule in ICAL format for the user
     *     responses:
     *       500:
     *         description: Internal server error
     */
  app.get('/exportIcalSchedule', async (req, res) => {
    await exportIcalSchedule(req, res).catch((error) => {
      console.error('Error in changing value of chosen for lecture:', error);
      res.status(500).send('Internal Server Error');
    });
  });

  // POST Endpoints
  /**
     * @swagger
     * /saveOptions:
     *   post:
     *     description: Saves user options in server database
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               option1:
     *                 type: string
     *                 description: Description of option1
     *               option2:
     *                 type: boolean
     *                 description: Description of option2
     *     responses:
     *       '200':
     *         description: Successful response
     */
  app.post('/saveOptions', async (req, res) => {
    await saveOptions(req, res).catch((error) => {
      console.error('Error in saving user options:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /importIcalFile:
     *   post:
     *     description: Imports ICAL file and saves it in server database
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               option1:
     *                 type: string
     *                 description: Description of option1
     *               option2:
     *                 type: boolean
     *                 description: Description of option2
     *     responses:
     *       '200':
     *         description: Successful response
     */
  app.post('/importIcalFile', upload.array('ics', 5), async (req, res) => {
    await importIcalFile(req, res).catch((error) => {
      console.error('Error in importing ICAL file:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  // DELETE Endpoints
  /**
     * @swagger
     * /deleteAllUserData:
     *   delete:
     *     description: Removes all user data from the server database
     *     responses:
     *       200:
     *         description: User data deleted successfully
     *       500:
     *         description: Failed to delete user data
     */
  app.delete('/deleteAllUserData', async (req, res) => {
    await deleteAllUserData(req, res).catch((error) => {
      console.error('Error in deleting user data:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  // Default route
  app.get('*', (req, res) => {
    res.status(404);
    res.sendFile(path.join(currentDir, 'public', 'html', 'default.html'));
  });
};

export default routing;
