import express from 'express';
import cors from 'cors';
import session from 'express-session';
import routing from './routing.js';

const app = express();

// Session middleware setup
app.use(session({
    secret: 'secret_key', // Encryption, tbd
    resave: false,
    saveUninitialized: true,
    cookie: { 
        expires: new Date(Date.now() + 360000), // 6 mins
        //secure: true, breaks stuff, so guess we won't have it secure :shrug:
        httpOnly: true
    }
}));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());

routing(app);

app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`)});
