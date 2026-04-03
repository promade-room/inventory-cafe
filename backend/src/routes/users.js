const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, nama_lengkap, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { username, password, nama_lengkap, role } = req.body;
    if (!username || !password || !nama_lengkap || !role) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)',
      [username, hash, nama_lengkap, role]
    );
    res.status(201).json({ message: 'User berhasil dibuat', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username sudah ada' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { nama_lengkap, role } = req.body;
    await db.query('UPDATE users SET nama_lengkap = ?, role = ? WHERE id = ?', [nama_lengkap, role, req.params.id]);
    res.json({ message: 'User berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const db = require('../config/database');
module.exports = router;