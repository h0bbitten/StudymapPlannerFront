import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { MoodleAPI, getMoodleInfo} from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routing = function(app) {
    app.get('/', async (req, res) => { // This doesn't work for some reason, fix,
        console.log(req.session.token);
        console.log(typeof(req.session.token));
        if (req.session.token) {
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
    app.get('/schedule', (req, res) => {
        // Send the /html/schedule.html file when /schedule is accessed
        res.sendFile(path.join(__dirname, 'public', 'html', 'schedule.html'));
/*      if (req.session.token) {
            res.sendFile(path.join(__dirname, 'public', 'html', 'schedule.html')); // Doesn't work here either, fix,
        } 
        else {
            res.redirect('/login');
        } */
    });
    app.get('/settings', (req, res) => {
        // Send the /html/settings.html file when /settings is accessed
        res.sendFile(path.join(__dirname, 'public', 'html', 'settings.html'));
    });
    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/img/favicon.ico'))
    });
    app.get('/MoodleAPI', async (req, res) => {
        await MoodleAPI(req, res).catch(error => {
            console.error("Error in MoodleAPI:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    app.get('/getMoodleInfo', async (req, res) => {
        await getMoodleInfo(req, res).catch(error => {
            console.error("Error in getMoodleInfo:", error);
            res.status(500).send("Internal Server Error");
        });
    });
};

export default routing;
