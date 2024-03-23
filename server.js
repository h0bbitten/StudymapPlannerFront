import express from 'express';
import cors from 'cors';
import routing from './routing.js';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());

routing(app);

app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`),
console.log(`To use program go to http://localhost:${PORT}/html/login.html`)});
