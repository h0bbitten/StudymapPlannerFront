CREATE DATABASE IF NOT EXISTS userData;
USE userData;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN details LONGTEXT;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    courseName VARCHAR(255) NOT NULL,
    ects INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(id) 
);

ALTER TABLE courses
ADD COLUMN contents LONGTEXT,
ADD COLUMN pages LONGTEXT;

ALTER TABLE users MODIFY details JSON;
ALTER TABLE courses ADD contents JSON, ADD pages JSON;
