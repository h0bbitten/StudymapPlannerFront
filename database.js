import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'studymaproot',
    database: 'users'
}).promise()

const result =await pool.query("SELECT * FROM users")
console.log(result)

export async function getToken(){
    const [result] = await pool.query(`
    INSERT INTO users (token)
    VALUE (?)
    `, [token])
    const id = result.insertId
}