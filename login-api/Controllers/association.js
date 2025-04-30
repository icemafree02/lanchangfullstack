const mysql = require('mysql2');
require('dotenv').config();

const urlDB = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  charset: 'utf8mb4'
}).promise(); 

console.log('db: Database pool created successfully ' );

module.exports = connection;