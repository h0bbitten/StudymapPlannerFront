import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import {swaggerDocs} from './server.js';
import {getMoodleInfo, testToken, saveOptions, getUserData} from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;


const routing = function(app) {
    swaggerDocs(app, PORT);
    
    //Gets
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
    app.get('/getMoodleInfo', async (req, res) => {
        await getMoodleInfo(req, res).catch(error => {
            console.error("Error in getMoodleInfo:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    app.get('/testToken', async (req, res) => {
        await testToken(req, res).catch(error => {
            console.error("Error in testToken:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    app.get('/getUserData', async (req, res) => {
        await getUserData(req, res).catch(error => {
            console.error("Error in getting user:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    app.get('*', (req, res) => {
        res.status(404);
        res.sendFile(path.join(__dirname, 'public', 'html', 'default.html'));
    });
    //Posts
    app.post('/saveOptions', async (req, res) => {
        await saveOptions(req, res).catch(error => {
            console.error("Error in saving user options:", error);
            res.status(500).send("Internal Server Error");
        });
    });
};

export default routing;
