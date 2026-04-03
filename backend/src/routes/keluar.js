const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

// GET all barang keluar
router.get('/', auth, async (req, res) => {
  try {
    const { tanggal_dari, tanggal_sampai, barang_id } = req.query;
    let query = `
      SELECT bk.*, b.nama as barang_nama, b.kode as barang_kode, u.nama_lengkap as user_nama
      FROM barang_keluars bk
      LEFT JOIN barangs b ON bk.barang_id = b.id
      LEFT JOIN users u ON bk.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (tanggal_dari) {
      query += ' AND bk.tanggal_keluar >= ?';
      params.push(tanggal_dari);
    }
    if (tanggal_sampai) {
      query += ' AND bk.tanggal_keluar <= ?';
      params.push(tanggal_sampai);
    }
    if (barang_id) {
      query += ' AND bk.barang_id = ?';
      params.push(barang_id);
    }

    query += ' ORDER BY bk.tanggal_keluar DESC, bk.id DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE barang keluar with FIFO logic
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { barang_id, jumlah, tanggal_keluar, keterangan } = req.body;
    
    if (!barang_id || !jumlah) {
      return res.status(400).json({ message: 'Barang dan jumlah wajib diisi' });
    }

    // Get current total stock
    const [stockResult] = await db.query(`
      SELECT 
        COALESCE((SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = ?), 0) -
        COALESCE((SELECT SUM(bk.jumlah) FROM barang_keluars bk WHERE bk.barang_id = ?), 0) as total_stok
    `, [barang_id, barang_id]);

    const totalStok = stockResult[0].total_stok || 0;
    if (jumlah > totalStok) {
      return res.status(400).json({ message: `Stok tidak cukup. Stok tersedia: ${totalStok}` });
    }

    // Get batches ordered by tanggal_masuk ASC (FIFO)
    const [batches] = await db.query(`
      SELECT bm.id, bm.jumlah as jumlah_awal, 
        COALESCE(bm.jumlah - COALESCE((SELECT SUM(ft.jumlah) FROM fifo_transactions ft JOIN barang_keluars bk ON ft.barang_keluar_id = bk.id WHERE ft.barang_masuk_id = bm.id AND bk.barang_id = ?), 0), 0) as sisa
      FROM barang_masuks bm
      WHERE bm.barang_id = ?
      ORDER BY bm.tanggal_masuk ASC, bm.id ASC
    `, [barang_id, barang_id]);

    // Create barang_keluar first
    const tgl_keluar = tanggal_keluar || new Date().toISOString().slice(0, 10);
    const [keluarResult] = await db.query(
      'INSERT INTO barang_keluars (barang_id, user_id, jumlah, tanggal_keluar, keterangan) VALUES (?, ?, ?, ?, ?)',
      [barang_id, req.user.id, jumlah, tgl_keluar, keterangan || null]
    );

    // FIFO: distribute quantity across batches
    let remainingQty = jumlah;
    for (const batch of batches) {
      if (remainingQty <= 0) break;
      
      const batchSisa = batch.sisa || 0;
      const qtyFromBatch = Math.min(remainingQty, batchSisa);
      
      if (qtyFromBatch > 0) {
        await db.query(
          'INSERT INTO fifo_transactions (barang_keluar_id, barang_masuk_id, jumlah) VALUES (?, ?, ?)',
          [keluarResult.insertId, batch.id, qtyFromBatch]
        );
        remainingQty -= qtyFromBatch;
      }
    }

    res.status(201).json({ message: 'Barang keluar berhasil dicatat (FIFO)', id: keluarResult.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE barang keluar
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Delete FIFO transactions first
    await db.query('DELETE FROM fifo_transactions WHERE barang_keluar_id = ?', [req.params.id]);
    await db.query('DELETE FROM barang_keluars WHERE id = ?', [req.params.id]);
    res.json({ message: 'Barang keluar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;