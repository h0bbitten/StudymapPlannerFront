import { MoodleAPI, ECTSscraper} from "./app.js";

const routing = function(app) {
    app.get('/', async (req, res) => {
        if (req.session.token) {
            res.redirect('/html/schedule.html');
        } 
        else {
            res.redirect('/html/login.html');
        }    
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
