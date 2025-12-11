const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Get low stock alerts
router.get('/', (req, res) => {
  db.all(
    `SELECT * FROM products 
     WHERE current_stock <= min_stock 
     ORDER BY (current_stock - min_stock) ASC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

module.exports = router;
