const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single product
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(row);
    }
  });
});

// Create product
router.post('/', (req, res) => {
  const { sku, name, description, category, current_stock, min_stock } = req.body;
  
  // Validation
  if (!sku || !name) {
    return res.status(400).json({ error: 'SKUと商品名は必須です' });
  }
  
  if (sku.trim().length === 0 || name.trim().length === 0) {
    return res.status(400).json({ error: 'SKUと商品名は空白のみにできません' });
  }
  
  if (current_stock < 0 || min_stock < 0) {
    return res.status(400).json({ error: '在庫数は0以上である必要があります' });
  }

  db.run(
    `INSERT INTO products (sku, name, description, category, current_stock, min_stock) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sku, name, description || '', category || '', current_stock || 0, min_stock || 5],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'このSKUは既に使用されています' });
        } else {
          res.status(500).json({ error: 'データベースエラーが発生しました' });
        }
      } else {
        res.status(201).json({ id: this.lastID, message: '商品を作成しました' });
      }
    }
  );
});

// Update product
router.put('/:id', (req, res) => {
  const { sku, name, description, category, current_stock, min_stock } = req.body;
  
  // Validation
  if (!sku || !name) {
    return res.status(400).json({ error: 'SKUと商品名は必須です' });
  }
  
  if (sku.trim().length === 0 || name.trim().length === 0) {
    return res.status(400).json({ error: 'SKUと商品名は空白のみにできません' });
  }
  
  if (current_stock < 0 || min_stock < 0) {
    return res.status(400).json({ error: '在庫数は0以上である必要があります' });
  }

  db.run(
    `UPDATE products 
     SET sku = ?, name = ?, description = ?, category = ?, current_stock = ?, min_stock = ?
     WHERE id = ?`,
    [sku, name, description || '', category || '', current_stock || 0, min_stock || 5, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'このSKUは既に使用されています' });
        } else {
          res.status(500).json({ error: 'データベースエラーが発生しました' });
        }
      } else if (this.changes === 0) {
        res.status(404).json({ error: '商品が見つかりません' });
      } else {
        res.json({ message: '商品を更新しました' });
      }
    }
  );
});

// Delete product
router.delete('/:id', (req, res) => {
  // First check if product exists and has transactions
  db.get(
    'SELECT COUNT(*) as tx_count FROM transactions WHERE product_id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラーが発生しました' });
      }
      
      if (result.tx_count > 0) {
        return res.status(400).json({ 
          error: 'この商品には取引履歴があるため削除できません' 
        });
      }
      
      db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          res.status(500).json({ error: 'データベースエラーが発生しました' });
        } else if (this.changes === 0) {
          res.status(404).json({ error: '商品が見つかりません' });
        } else {
          res.json({ message: '商品を削除しました' });
        }
      });
    }
  );
});

module.exports = router;
