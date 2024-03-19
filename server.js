const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Assuming addition of cors package for simplicity

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors()); // Apply CORS for all routes

app.get('/getcourses', async (req, res) => {
  try {
    const token = req.query.token;
    const url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&classification=inprogress`
    const response = await axios.get(url);
    res.send(response.data);
  } catch {
    res.status(500).send('Error fetching users courses');
  }
});

app.get('/getcourse', async (req, res) => {
  try {
    const token = req.query.token;
    const id = req.query.id;
    const url = `https://www.moodle.aau.dk/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=${id}`
    const response = await axios.get(url);
    res.send(response.data);
  } catch {
    res.status(500).send(`Error fetching course id: ${id}`);
  }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
// In this example, the server is using the Express.js framework to create an HTTP server.