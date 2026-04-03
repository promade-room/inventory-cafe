const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY nama ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { nama, alamat, telepon, email, catatan } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama supplier wajib diisi' });
    
    const [result] = await db.query(
      'INSERT INTO suppliers (nama, alamat, telepon, email, catatan) VALUES (?, ?, ?, ?, ?)',
      [nama, alamat || null, telepon || null, email || null, catatan || null]
    );
    res.status(201).json({ message: 'Supplier berhasil dibuat', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { nama, alamat, telepon, email, catatan } = req.body;
    await db.query(
      'UPDATE suppliers SET nama = ?, alamat = ?, telepon = ?, email = ?, catatan = ? WHERE id = ?',
      [nama, alamat, telepon, email, catatan, req.params.id]
    );
    res.json({ message: 'Supplier berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;