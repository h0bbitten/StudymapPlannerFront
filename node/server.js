import express from 'express';
import cors from 'cors';
import session from 'express-session';
import multer from 'multer';
import routing from './routing.js';

const app = express();

const upload = multer({ dest: './database/icals/' });

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 3600000, // 60 mins
    // secure: true, breaks stuff, so guess we won't have it secure :shrug:
    httpOnly: true,
  },
}));

app.use(cors());

app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;

app.use(express.static('node/public'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  routing(app, upload);
});
