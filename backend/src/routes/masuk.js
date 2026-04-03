const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Generate batch number
const generateBatchNumber = () => {
  const date = new Date();
  const batch = date.toISOString().slice(0,10).replace(/-/g, '') + '-' + uuidv4().slice(0,8).toUpperCase();
  return batch;
};

// GET all barang masuk
router.get('/', auth, async (req, res) => {
  try {
    const { tanggal_dari, tanggal_sampai, barang_id } = req.query;
    let query = `
      SELECT bm.*, b.nama as barang_nama, b.kode as barang_kode, s.nama as supplier_nama, u.nama_lengkap as user_nama
      FROM barang_masuks bm
      LEFT JOIN barangs b ON bm.barang_id = b.id
      LEFT JOIN suppliers s ON bm.supplier_id = s.id
      LEFT JOIN users u ON bm.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (tanggal_dari) {
      query += ' AND bm.tanggal_masuk >= ?';
      params.push(tanggal_dari);
    }
    if (tanggal_sampai) {
      query += ' AND bm.tanggal_masuk <= ?';
      params.push(tanggal_sampai);
    }
    if (barang_id) {
      query += ' AND bm.barang_id = ?';
      params.push(barang_id);
    }

    query += ' ORDER BY bm.tanggal_masuk DESC, bm.id DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE barang masuk (FIFO batch)
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { barang_id, supplier_id, jumlah, harga_satuan, tanggal_masuk, tanggal_kadaluarsa } = req.body;
    
    if (!barang_id || !jumlah || !harga_satuan) {
      return res.status(400).json({ message: 'Barang, jumlah, dan harga wajib diisi' });
    }

    const batch_number = generateBatchNumber();
    const tgl_masuk = tanggal_masuk || new Date().toISOString().slice(0, 10);

    const [result] = await db.query(
      'INSERT INTO barang_masuks (barang_id, supplier_id, user_id, batch_number, jumlah, harga_satuan, tanggal_masuk, tanggal_kadaluarsa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [barang_id, supplier_id || null, req.user.id, batch_number, jumlah, harga_satuan, tgl_masuk, tanggal_kadaluarsa || null]
    );

    res.status(201).json({ message: 'Barang masuk berhasil dicatat', id: result.insertId, batch_number });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE barang masuk
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Check if sudah ada transaksi FIFO
    const [check] = await db.query(
      'SELECT ft.id FROM fifo_transactions ft JOIN barang_keluars bk ON ft.barang_keluar_id = bk.id JOIN barang_masuks bm ON ft.barang_masuk_id = bm.id WHERE bm.id = ?',
      [req.params.id]
    );
    
    if (check.length > 0) {
      return res.status(400).json({ message: 'Tidak bisa hapus, batch sudah digunakan di transaksi' });
    }

    await db.query('DELETE FROM barang_masuks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Barang masuk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;