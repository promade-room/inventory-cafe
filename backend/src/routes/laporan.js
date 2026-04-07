const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

// GET laporan stok
router.get('/stok', auth, async (req, res) => {
  try {
    const { bulan = null } = req.query;
    
    let masukFilter = '';
    let keluarFilter = '';
    if (bulan) {
      const [year, month] = bulan.split('-');
      masukFilter = `AND MONTH(tanggal_masuk) = ${parseInt(month)} AND YEAR(tanggal_masuk) = ${parseInt(year)}`;
      keluarFilter = `AND MONTH(tanggal_keluar) = ${parseInt(month)} AND YEAR(tanggal_keluar) = ${parseInt(year)}`;
    }
    
    let query = `
      SELECT 
        b.id, b.kode, b.nama, b.satuan, b.minimal_stok,
        k.nama as kategori_nama,
        COALESCE((SELECT SUM(jumlah) FROM barang_masuks WHERE barang_id = b.id ${masukFilter}), 0) as total_masuk,
        COALESCE((SELECT SUM(jumlah) FROM barang_keluars WHERE barang_id = b.id ${keluarFilter}), 0) as total_keluar,
        COALESCE((SELECT SUM(jumlah) FROM barang_masuks WHERE barang_id = b.id), 0) -
        COALESCE((SELECT SUM(jumlah) FROM barang_keluars WHERE barang_id = b.id), 0) as stok_sekarang,
        COALESCE((SELECT AVG(harga_satuan) FROM barang_masuks WHERE barang_id = b.id), 0) as avg_harga
      FROM barangs b
      LEFT JOIN kategoris k ON b.kategori_id = k.id
      ORDER BY b.nama ASC
    `;
    
    const [rows] = await db.query(query);
    
    // Calculate total nilai
    const data = rows.map(row => ({
      ...row,
      total_nilai: (row.stok_sekarang || 0) * (row.avg_harga || 0)
    }));
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET laporan expired
router.get('/expired', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT bm.*, b.nama as barang_nama, b.kode as barang_kode,
        COALESCE(bm.jumlah - COALESCE((SELECT SUM(ft.jumlah) FROM fifo_transactions ft JOIN barang_keluars bk ON ft.barang_keluar_id = bk.id WHERE ft.barang_masuk_id = bm.id), 0), 0) as sisa,
        DATEDIFF(bm.tanggal_kadaluarsa, CURDATE()) as hari_expired
      FROM barang_masuks bm
      LEFT JOIN barangs b ON bm.barang_id = b.id
      WHERE bm.tanggal_kadaluarsa IS NOT NULL
      AND bm.tanggal_kadaluarsa <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY bm.tanggal_kadaluarsa ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET laporan movement (grafik)
router.get('/movement', auth, async (req, res) => {
  try {
    const { type = 'harian', bulan = null } = req.query;
    
    let dateFormat, groupBy;
    
    if (type === 'bulanan') {
      dateFormat = '%Y-%m';
      groupBy = '%Y-%m';
    } else {
      dateFormat = '%Y-%m-%d';
      groupBy = '%Y-%m-%d';
    }
    
    // Barang Masuk
    const [masuk] = await db.query(`
      SELECT DATE_FORMAT(tanggal_masuk, ?) as tanggal, SUM(jumlah) as total
      FROM barang_masuks
      WHERE tanggal_masuk >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(tanggal_masuk, ?)
      ORDER BY tanggal ASC
    `, [dateFormat, groupBy]);
    
    // Barang Keluar
    const [keluar] = await db.query(`
      SELECT DATE_FORMAT(tanggal_keluar, ?) as tanggal, SUM(jumlah) as total
      FROM barang_keluars
      WHERE tanggal_keluar >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(tanggal_keluar, ?)
      ORDER BY tanggal ASC
    `, [dateFormat, groupBy]);
    
    // Top 10 barang keluar
    const [topKeluar] = await db.query(`
      SELECT b.nama, SUM(bk.jumlah) as total_keluar
      FROM barang_keluars bk
      JOIN barangs b ON bk.barang_id = b.id
      WHERE bk.tanggal_keluar >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY b.id
      ORDER BY total_keluar DESC
      LIMIT 10
    `);
    
    res.json({ masuk, keluar, top_keluar: topKeluar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;