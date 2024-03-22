const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Assuming addition of cors package for simplicity

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors()); // Apply CORS for all routes

app.get('/MoodleAPI', async (req, res) => {
  try {
    const token = req.query.token;
    const method = req.query.wsfunction;
    let url = '';
    switch (method) {
      case 'core_course_get_enrolled_courses_by_timeline_classification':
        url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}&classification=inprogress`;
        break;
      case 'core_webservice_get_site_info':
        url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=${method}`
      default:
        break;
    }
    console.log('\n',`Called MoodleApi method: `,method,'\n', url,'\n');
    const response = await axios.get(url);
    res.send(response.data);
  } catch {
    res.status(500).send(`Error fetching method`);
  }
})

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`), console.log(`To use program go to http://localhost:${PORT}/html/login.html`));
// In this example, the server is using the Express.js framework to create an HTTP server.