const express = require('express');
const app = express();
const port = 3000; // Or any other port number you prefer

// Define routes and middleware for your Express application

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
