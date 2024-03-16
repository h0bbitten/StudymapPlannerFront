const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/ical', async (req, res) => {
  try {
    const response = await axios.get('https://www.moodle.aau.dk/local/planning/ical.php?fid=3249');
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching iCal data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
