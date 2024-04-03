import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'studymaproot',
    database: 'users'
}).promise()

const result =await pool.query("SELECT * FROM users")
console.log(result)