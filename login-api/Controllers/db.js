const mysql = require('mysql2');

const database = "mydb"

const connection = mysql.createConnection({
  host: 'localhost',     
  user: 'root',        
  password: '',  
  database: database    
});

connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
    return;
  }
  console.log('db: Successfully connected to the database, database: ', database);
});


module.exports = connection
