const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kategoris ORDER BY nama ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { nama, icon, color } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama wajib diisi' });
    
    const [result] = await db.query('INSERT INTO kategoris (nama, icon, color) VALUES (?, ?, ?)', [nama, icon || null, color || null]);
    res.status(201).json({ message: 'Kategori berhasil dibuat', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { nama, icon, color } = req.body;
    await db.query('UPDATE kategoris SET nama = ?, icon = ?, color = ? WHERE id = ?', [nama, icon, color, req.params.id]);
    res.json({ message: 'Kategori berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM kategoris WHERE id = ?', [req.params.id]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;