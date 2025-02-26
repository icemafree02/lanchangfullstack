const mysql = require('mysql2');

const database = "mydb";


const connection = mysql.createPool({
  host: 'localhost',     
  user: 'root',        
  password: '',  
  database: database,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0
}).promise(); 



console.log('db: Database pool created successfully, database: ', database);

module.exports = connection;