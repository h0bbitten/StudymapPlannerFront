import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import swaggerDocs from './swagger.js';
import {
  getMoodleInfo, logIn, saveOptions, getUserData, calculateSchedule,
} from './app.js';

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilename);
const PORT = process.env.PORT || 3000;

const routing = function routes(app) {
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
     *     description: Retrieves Moodle information from Moodle API and server manipulations
     *     responses:
     *       200:
     *         description: Successful response
     *       500:
     *         description: Internal server error
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
  app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Internal Server Error');
      }
      return res.redirect('/login');
    });
  });
  app.get('/calculateSchedule', async (req, res) => {
    await calculateSchedule(req, res).catch((error) => {
      console.error('Error in getting calculating schedule:', error);
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
  // Default route
  app.get('*', (req, res) => {
    res.status(404);
    res.sendFile(path.join(currentDir, 'public', 'html', 'default.html'));
  });
};

export default routing;