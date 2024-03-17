const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Assuming addition of cors package for simplicity

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors()); // Apply CORS for all routes

app.get('/ical', async (req, res) => {
  try {
    const response = await axios.get('https://www.moodle.aau.dk/local/planning/ical.php?fid=3249');
    res.send(response.data);
  } catch {
    res.status(500).send('Error fetching iCal data');
  }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
// In this example, the server is using the Express.js framework to create an HTTP server.