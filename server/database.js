const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          current_stock INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          type TEXT CHECK(type IN ('in', 'out')) NOT NULL,
          quantity INTEGER NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL
        )
      `);

      // Create default admin user if not exists
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        `INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`,
        ['admin', defaultPassword],
        (err) => {
          if (err) reject(err);
          else {
            console.log('Database initialized successfully');
            resolve();
          }
        }
      );
    });
  });
}

module.exports = { db, initializeDatabase };
