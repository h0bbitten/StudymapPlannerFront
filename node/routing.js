import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import {swaggerDocs} from './swagger.js';
import {getMoodleInfo, testToken, saveOptions, getUserData} from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;


const routing = function(app) {
    // Swagger setup
    swaggerDocs(app, PORT);
    
    //Side routes
    app.get('/', async (req, res) => {
        console.log(req.session.loggedIn);
        if (req.session.loggedIn === true) {
            res.redirect('/schedule');
        }
        else {
            res.redirect('/login');
        }    
    });

    app.get('/login', (req, res) => {
        // Send the /html/login.html file when /login is accessed
        res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
    });
    app.get('/setup', (req, res) => {
        // Send the /html/setup.html file when /setup is accessed
        if (req.session.loggedIn === true) {
            res.sendFile(path.join(__dirname, 'public', 'html', 'setup.html'));
        }
        else {
            res.redirect('/login');
        }  
    });
    app.get('/schedule', (req, res) => {
        // Send the /html/schedule.html file when /schedule is accessed
        console.log('User is logged in: ',req.session.loggedIn)
        if (req.session.loggedIn === true) {
            res.sendFile(path.join(__dirname, 'public', 'html', 'schedule.html'));
        }
        else {
            res.redirect('/login');
        }  
    });
    app.get('/settings', (req, res) => {
        // Send the /html/settings.html file when /settings is accessed
        res.sendFile(path.join(__dirname, 'public', 'html', 'settings.html'));
    });
    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/img/favicon.ico'))
    });

    //GET Endpoints
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
        await getMoodleInfo(req, res).catch(error => {
            console.error("Error in getMoodleInfo:", error);
            res.status(500).send("Internal Server Error");
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
    app.get('/testToken', async (req, res) => {
        await testToken(req, res).catch(error => {
            console.error("Error in testToken:", error);
            res.status(500).send("Internal Server Error");
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
        await getUserData(req, res).catch(error => {
            console.error("Error in getting user:", error);
            res.status(500).send("Internal Server Error");
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
        await saveOptions(req, res).catch(error => {
            console.error("Error in saving user options:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    //Default route
    app.get('*', (req, res) => {
        res.status(404);
        res.sendFile(path.join(__dirname, 'public', 'html', 'default.html'));
    });
};

export default routing;
