import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { MoodleAPI, ECTSscraper} from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routing = function(app) {
    app.get('/', async (req, res) => { // This doesn't work for some reason, fix
        console.log(req.session.token);
        console.log(typeof(req.session.token));
        if (req.session.token) {
            res.redirect('/html/schedule.html');
        } 
        else {
            res.redirect('/html/login.html');
        }    
    });
    app.get('/favicon.ico', (req, res) => { // And this doesn't work for some reason, fix
        console.log(path.join('Called favicon',__dirname, '/public/img/favicon.ico'));
        res.sendFile(path.join(__dirname, '/public/img/favicon.ico'))
    });
    app.get('/MoodleAPI', async (req, res) => {
        await MoodleAPI(req, res).catch(error => {
            console.error("Error in MoodleAPI:", error);
            res.status(500).send("Internal Server Error");
        });
    });
    app.get('/webscraper', async (req, res) => {
        await ECTSscraper(req, res).catch(error => {
            console.error("Error in ECTSscraper:", error);
            res.status(500).send("Internal Server Error");
        });
    });
};

export default routing;
