const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Export products to CSV
router.get('/', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create CSV header
    const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Description', 'Created At'];
    let csv = headers.join(',') + '\n';

    // Add data rows
    rows.forEach(row => {
      const values = [
        escapeCSV(row.sku),
        escapeCSV(row.name),
        escapeCSV(row.category),
        row.current_stock,
        row.min_stock,
        escapeCSV(row.description),
        row.created_at
      ];
      csv += values.join(',') + '\n';
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-${Date.now()}.csv"`);
    res.send(csv);
  });
});

// Helper function to escape CSV values
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = router;
