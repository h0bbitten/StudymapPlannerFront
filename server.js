import express from 'express';
import cors from 'cors';
import session from 'express-session';
import routing from './routing.js';

import pg from 'pg';
const {Pool} = pg;

const app = express();

// Initialize a PostgreSQL connection pool
const pool = new Pool({
  host: 'localhost',
  port: 3000,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

// Function to create the users table if it doesn't exist
async function createUsersTable() {
  try {
    // Check if the users table exists
    const result = await pool.query(
        `SELECT EXISTS (
                SELECT 1
                FROM   information_schema.tables 
                WHERE  table_name = 'users'
            )`,
    );

    // If the users table doesn't exist, create it
    if (!result.rows[0].exists) {
      await pool.query(
          `CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    token VARCHAR(255) NOT NULL
                )`,
      );
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists');
    }
  } catch (error) {
    console.error('Error creating users table:', error);
  }
}

// Call the function to create the users table
createUsersTable();

// Session middleware setup
app.use(session({
  secret: 'secret_key', // Encryption, tbd
  resave: false,
  saveUninitialized: false,
}));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());

routing(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
