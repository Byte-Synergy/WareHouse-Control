const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Stock In - Add inventory
router.post('/in', (req, res) => {
  const { product_id, quantity, notes } = req.body;
  
  // Enhanced validation
  if (!product_id || !quantity) {
    return res.status(400).json({ error: '商品IDと数量は必須です' });
  }
  
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: '数量は正の整数である必要があります' });
  }
  
  if (quantity > 100000) {
    return res.status(400).json({ error: '数量は100,000以下である必要があります' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert transaction record
    db.run(
      `INSERT INTO transactions (product_id, type, quantity, notes) VALUES (?, 'in', ?, ?)`,
      [product_id, quantity, notes || ''],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        // Update product stock
        db.run(
          `UPDATE products SET current_stock = current_stock + ? WHERE id = ?`,
          [quantity, product_id],
          function(updateErr) {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: updateErr.message });
            }

            db.run('COMMIT');
            res.json({ 
              message: 'Stock added successfully',
              transaction_id: this.lastID 
            });
          }
        );
      }
    );
  });
});

// Stock Out - Remove inventory
router.post('/out', (req, res) => {
  const { product_id, quantity, notes } = req.body;
  
  // Enhanced validation
  if (!product_id || !quantity) {
    return res.status(400).json({ error: '商品IDと数量は必須です' });
  }
  
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: '数量は正の整数である必要があります' });
  }
  
  if (quantity > 100000) {
    return res.status(400).json({ error: '数量は100,000以下である必要があります' });
  }

  db.serialize(() => {
    // Check if enough stock available
    db.get(
      'SELECT current_stock FROM products WHERE id = ?',
      [product_id],
      (err, product) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        if (product.current_stock < quantity) {
          return res.status(400).json({ 
            error: `在庫不足です。現在庫: ${product.current_stock}個、要求: ${quantity}個`,
            available: product.current_stock,
            requested: quantity
          });
        }

        db.run('BEGIN TRANSACTION');

        // Insert transaction record
        db.run(
          `INSERT INTO transactions (product_id, type, quantity, notes) VALUES (?, 'out', ?, ?)`,
          [product_id, quantity, notes || ''],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            // Update product stock
            db.run(
              `UPDATE products SET current_stock = current_stock - ? WHERE id = ?`,
              [quantity, product_id],
              function(updateErr) {
                if (updateErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: updateErr.message });
                }

                db.run('COMMIT');
                res.json({ 
                  message: 'Stock removed successfully',
                  transaction_id: this.lastID 
                });
              }
            );
          }
        );
      }
    );
  });
});

// Get transaction history for a product
router.get('/history/:product_id', (req, res) => {
  db.all(
    `SELECT * FROM transactions WHERE product_id = ? ORDER BY created_at DESC`,
    [req.params.product_id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get all transactions
router.get('/history', (req, res) => {
  db.all(
    `SELECT t.*, p.name as product_name, p.sku 
     FROM transactions t 
     JOIN products p ON t.product_id = p.id 
     ORDER BY t.created_at DESC 
     LIMIT 100`,
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
