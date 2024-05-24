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
  *         get:
  *           summary: Get Moodle information
  *           description: Retrieves Moodle information about the logged-in user and their enrolled courses.
  *           responses:
  *             200:
  *               description: Successful response containing user and course information.
  *               content:
  *                 application/json:
  *                   schema:
  *                     type: object
  *                     properties:
  *                       userid:
  *                         type: integer
  *                         description: The user's unique ID on the Moodle platform.
  *                       fullname:
  *                         type: string
  *                         description: The user's full name as displayed in Moodle.
  *                       userpictureurl:
  *                         type: string
  *                         description: (optional) The URL to the user's profile picture in Moodle.
  *                       sitename:
  *                         type: string
  *                         description: The name of the Moodle site.
  *                       siteurl:
  *                         type: string
  *                         description: The base URL of the Moodle site.
  *                       lang:
  *                         type: string
  *                         description: The language used in the Moodle site interface.
  *                       courses:
  *                         type: array
  *                         items:
  *                           type: object
  *                           properties:
  *                             id:
  *                               type: integer
  *                               description: The unique ID of the course on the Moodle platform.
  *                             shortname:
  *                               type: string
  *                               description: The short name of the course as displayed in Moodle.
  *                             fullnamecourse:  # Changed to fullname
  *                               type: string
  *                               description: The full name of the course.
  *                             categoryid:
  *                               type: integer
  *                               description: (optional) The ID of the category the course belongs to (if applicable).
  *                             startdate:
  *                               type: string
  *                               description: The start date of the course in ISO 8601 format.
  *                             visible:
  *                               type: boolean
  *                               description: Whether the course is visible to the user.
  *                             progress:
  *                               type: number
  *                               description: (optional) The user's progress percentage in the course (if available from Moodle webservice).
  *                             moduleLinks:
  *                               type: array
  *                               items:
  *                                 type: string
  *                                 description: (optional) An array containing links to the user's enrolled modules within the course.
  *                   examples:
  *                     application/json:
  *                       value:
  *                         userid: 123
  *                         fullname: "John Doe"
  *                         userpictureurl: "https://moodle.org/user123.jpg"
  *                         sitename: "My Moodle Site"
  *                         siteurl: "https://moodle.org"
  *                         lang: "en"
  *                         courses:
  *                           -  # Use a hyphen for the first element in the list
  *                             id: 456
  *                             shortname: "MATH101"
  *                             fullname: "Introduction to Mathematics"  # Corrected property name
  *                             categoryid: 1
  *                             startdate: "2022-01-01T00:00:00Z"
  *                             visible: true
  *                             progress: 50
  *                             moduleLinks:
  *                               - "https://moodle.org/course456/module1"
  *                               - "https://moodle.org/course456/module2"
  *             500:
  *               description: Internal server error occurred during processing.
  */
  app.get('/getMoodleInfo', async (req, res) => {
    await getMoodleInfo(req, res).catch((error) => {
      console.error('Error in getMoodleInfo:', error);
      res.status(500).send('Internal Server Error');
    });
  });
  /**
     * @swagger
     * /getLogIn:
     *   get:
     *     summary: Log in
     *     description: Tests user token against Moodle API
     *     parameters:
     *      - in: path
     *        name: token
     *        type: string
     *        required: true
     *        description: The Moodle access token to test against the Moodle API
     *     responses:
     *       200:
     *         description: Successful response
     *       400:
     *         description: Invalid token
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
  *     get:
  *       summary: Get user data
  *       description: Gets users data from server database
  *       responses:
  *         200:
  *           description: Successful response
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                       userid:
  *                         type: integer
  *                         description: The user's unique ID on the Moodle platform.
  *                       fullname:
  *                         type: string
  *                         description: The user's full name as displayed in Moodle.
  *                       userpictureurl:
  *                         type: string
  *                         description: (optional) The URL to the user's profile picture in Moodle.
  *                       sitename:
  *                         type: string
  *                         description: The name of the Moodle site.
  *                       siteurl:
  *                         type: string
  *                         description: The base URL of the Moodle site.
  *                       lang:
  *                         type: string
  *                         description: The language used in the Moodle site interface.
  *                       courses:
  *                         type: array
  *                         items:
  *                           type: object
  *                           properties:
  *                             id:
  *                               type: integer
  *                               description: The unique ID of the course on the Moodle platform.
  *                             shortname:
  *                               type: string
  *                               description: The short name of the course as displayed in Moodle.
  *                             fullnamecourse:  # Changed to fullname
  *                               type: string
  *                               description: The full name of the course.
  *                             categoryid:
  *                               type: integer
  *                               description: (optional) The ID of the category the course belongs to (if applicable).
  *                             startdate:
  *                               type: string
  *                               description: The start date of the course in ISO 8601 format.
  *                             visible:
  *                               type: boolean
  *                               description: Whether the course is visible to the user.
  *                             progress:
  *                               type: number
  *                               description: (optional) The user's progress percentage in the course (if available from Moodle webservice).
  *                             moduleLinks:
  *                               type: array
  *                               items:
  *                                 type: string
  *                                 description: (optional) An array containing links to the user's enrolled modules within the course.
  *         500:
  *           description: Internal server error
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
     *     summary: Logs out the user
     *     description: Logs out the user and invalidates the session
     *     responses:
     *       302:
     *         description: Successfully logged out and redirected to login page
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
  *     get:
  *       summary: Get schedule
  *       description: Gets schedule from Moodle server database
  *       responses:
  *         200:
  *           description: Successful response
  *           content:
  *               application/json:
  *                 schema:
  *                   type: object
  *                   properties:
  *                     Schedule:
  *                       description: Information about the user's schedule (Structure needed here)
  *         500:
  *           description: Internal server error
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
  *     get:
  *       summary: Change lecture chosen status
  *       description: Updates the chosen status of a lecture for a course belonging to the logged-in user.
  *       security:
  *         - Moodle_Authentication_Token: []
  *       parameters:
  *         - in: query
  *           name: courseID
  *           description: The unique ID of the course.
  *           required: true
  *           schema:
  *             type: integer
  *         - in: query
  *           name: lectureID
  *           description: The unique ID of the lecture.
  *           required: true
  *           schema:
  *             type: integer
  *         - in: query
  *           name: chosen
  *           description: The new chosen status for the lecture (true or false).
  *           required: true
  *           schema:
  *             type: string
  *       responses:
  *         200:
  *           description: Lecture chosen status changed successfully.
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   success:
  *                     type: boolean
  *                     description: Indicates successful operation.
  *                   lectureID:
  *                     type: integer
  *                     description: The ID of the updated lecture.
  *                   courseID:
  *                     type: integer
  *                     description: The ID of the course the lecture belongs to.
  *                   chosen:
  *                     type: boolean
  *                     description: The updated chosen status of the lecture.
  *         400:
  *           description: Bad request (missing or invalid parameters).
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   error:
  *                     type: string
  *                     description: Error message indicating the issue.
  *         401:
  *           description: Unauthorized access (requires authentication).
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   error:
  *                     type: string
  *                     description: Error message indicating unauthorized access.
  *         500:
  *           description: Internal server error occurred during processing.
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   success:
  *                     type: boolean
  *                     description: Indicates failure.
  *                   error:
  *                     type: string
  *                     description: Generic error message.
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
  *     get:
  *       summary: Export iCal schedule
  *       description: Retrieves and exports the user's iCal schedule containing lectures, exams, and exam repetitions.
  *       parameters:
  *         - in: query
  *           name: userID
  *           description: The unique ID of the user.
  *           required: true
  *           schema:
  *             type: string
  *       responses:
  *         200:
  *           description: Successful response with iCal data.
  *           content:
  *             text/calendar:
  *               schema:
  *                 type: string
  *                 description: The user's schedule data in iCal format.
  *         400:
  *           description: Bad request (missing or invalid user ID).
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   error:
  *                     type: string
  *                     description: Error message indicating the issue.
  *         500:
  *           description: Internal server error occurred during processing.
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   error:
  *                     type: string
  *                     description: Generic error message.
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
  *     post:
  *       summary: Save user options
  *       description: Saves the user's options, including imported calendar settings. This endpoint allows users to remove specific imported calendars.
  *       requestBody:
  *         required: true
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 settings:
  *                   type: object
  *                   description: User settings object containing imported calendar data.
  *                   properties:
  *                     importedCalendars:
  *                       type: array
  *                       description: An array of imported calendar objects.
  *                       items:
  *                         type: object
  *                         properties:
  *                           type:
  *                             type: string
  *                             description: Indicates the action for the calendar ("remove" for removing a calendar).
  *                           name:
  *                             type: string
  *                             description: The name of the imported calendar file.
  *       responses:
  *         200:
  *           description: User data saved successfully.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Success message.
  *         500:
  *           description: Internal server error occurred during processing.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Generic error message.
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
  *     post:
  *       summary: Import iCal file(s)
  *       description: Allows users to upload iCal files containing calendar data.
  *       requestBody:
  *         required: true
  *         content:
  *           multipart/form-data:
  *             schema:
  *               type: object
  *               properties:
  *                 files:
  *                   type: array
  *                   description: An array of uploaded iCal files.
  *                   items:
  *                     type: string
  *                     format: binary
  *       responses:
  *         200:
  *           description: Files uploaded successfully.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Success message.
  *         500:
  *           description: Internal server error occurred during processing.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Generic error message.
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
  *     delete:
  *       summary: Delete all user data
  *       description: Deletes all user data associated with the logged-in user, including their JSON data file and any imported calendar files.
  *       security:
  *         - Moodle_Authentication_Token: []
  *       responses:
  *         200:
  *           description: User data deleted successfully.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Success message.
  *         401:
  *           description: Unauthorized access (requires authentication).
  *           content:
  *             application/json:
  *               schema:
  *                 type: object
  *                 properties:
  *                   error:
  *                     type: string
  *                     description: Error message indicating unauthorized access.
  *         500:
  *           description: Internal server error occurred during processing.
  *           content:
  *             application/json:
  *               schema:
  *                 type: string
  *                 description: Generic error message.
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
