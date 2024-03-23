import express from 'express';
import cors from 'cors';
import session from 'express-session';
import routing from './routing.js';

const app = express();

// Session middleware setup
app.use(session({
    secret: 'secret_key', // Encryption, tbd
    resave: false,
    saveUninitialized: false
}));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());

routing(app);

app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`)});
