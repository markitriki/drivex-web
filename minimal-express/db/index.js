const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'DriveX',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function ensureUsersSchema() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255),
      password VARCHAR(255),
      is_admin TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  pool.query(createTableSql, (createErr) => {
    if (createErr) {
      console.error('Users table creation error:', createErr);
      return;
    }

    const requiredColumns = [
      { name: 'email', alter: 'ADD COLUMN email VARCHAR(255) AFTER username' },
      { name: 'password', alter: 'ADD COLUMN password VARCHAR(255) AFTER email' },
      { name: 'is_admin', alter: 'ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER password' }
    ];

    requiredColumns.forEach((col) => {
      pool.query('SHOW COLUMNS FROM Users LIKE ?', [col.name], (showErr, results) => {
        if (showErr) {
          console.error('Error inspecting Users table:', showErr);
          return;
        }
        if (!results.length) {
          pool.query(`ALTER TABLE Users ${col.alter}`, (alterErr) => {
            if (alterErr) {
              console.error(`Error adding column ${col.name}:`, alterErr);
            } else {
              console.log(`Column ${col.name} added to Users table`);
            }
          });
        }
      });
    });
  });
}

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL connection OK');
  connection.release();
  ensureUsersSchema();
});

module.exports = pool;
