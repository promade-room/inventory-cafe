const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

// GET all barang with computed stock
router.get('/', auth, async (req, res) => {
  try {
    const { search, kategori_id } = req.query;
    let query = `
      SELECT b.*, k.nama as kategori_nama,
      COALESCE(
        (SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = b.id) -
        (SELECT COALESCE(SUM(bk.jumlah), 0) FROM barang_keluars bk WHERE bk.barang_id = b.id)
      , 0) as stok_sekarang
      FROM barangs b
      LEFT JOIN kategoris k ON b.kategori_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (b.kode LIKE ? OR b.nama LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (kategori_id) {
      query += ' AND b.kategori_id = ?';
      params.push(kategori_id);
    }

    query += ' ORDER BY b.nama ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single barang with batches
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, k.nama as kategori_nama,
      COALESCE(
        (SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = b.id) -
        (SELECT COALESCE(SUM(bk.jumlah), 0) FROM barang_keluars bk WHERE bk.barang_id = b.id)
      , 0) as stok_sekarang
      FROM barangs b
      LEFT JOIN kategoris k ON b.kategori_id = k.id
      WHERE b.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    // Get batches
    const [batches] = await db.query(`
      SELECT bm.*, s.nama as supplier_nama,
        COALESCE(bm.jumlah - COALESCE((SELECT SUM(ft.jumlah) FROM fifo_transactions ft JOIN barang_keluars bk ON ft.barang_keluar_id = bk.id WHERE ft.barang_masuk_id = bm.id AND bk.barang_id = ?), 0), 0) as sisa
      FROM barang_masuks bm
      LEFT JOIN suppliers s ON bm.supplier_id = s.id
      WHERE bm.barang_id = ?
      ORDER BY bm.tanggal_masuk ASC
    `, [req.params.id, req.params.id]);

    res.json({ ...rows[0], batches });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE barang
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { kode, nama, kategori_id, satuan, minimal_stok } = req.body;
    if (!kode || !nama || !satuan) {
      return res.status(400).json({ message: 'Kode, nama, dan satuan wajib diisi' });
    }

    const [result] = await db.query(
      'INSERT INTO barangs (kode, nama, kategori_id, satuan, minimal_stok) VALUES (?, ?, ?, ?, ?)',
      [kode, nama, kategori_id || null, satuan, minimal_stok || 0]
    );
    res.status(201).json({ message: 'Barang berhasil dibuat', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kode barang sudah ada' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE barang
router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { kode, nama, kategori_id, satuan, minimal_stok } = req.body;
    await db.query(
      'UPDATE barangs SET kode = ?, nama = ?, kategori_id = ?, satuan = ?, minimal_stok = ? WHERE id = ?',
      [kode, nama, kategori_id, satuan, minimal_stok, req.params.id]
    );
    res.json({ message: 'Barang berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE barang
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM barangs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;