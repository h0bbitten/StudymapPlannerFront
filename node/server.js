import express from 'express';
import cors from 'cors';
import session from 'express-session';
import routing from './routing.js';



const app = express();

// Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET|| 'secret_key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        maxAge: 360000, // 6 mins
        //secure: true, breaks stuff, so guess we won't have it secure :shrug:
        httpOnly: true
    }
}));

app.use(express.json({limit: '10mb'}));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('node/public'));
app.use(cors());


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    routing(app);
});


/*
 * 
 * TODO:
 *      -We have two package.json files in the project, one in the root directory and one in the client directory.
 *      
 *
 *
 *
 */