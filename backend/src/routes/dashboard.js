const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/database');

// GET dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Total item barang
    const [totalBarang] = await db.query('SELECT COUNT(*) as total FROM barangs');
    
    // Total nilai stok (估算)
    const [nilaiStok] = await db.query(`
      SELECT COALESCE(SUM(
        (COALESCE((SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = b.id), 0) -
        COALESCE((SELECT SUM(bk.jumlah) FROM barang_keluars bk WHERE bk.barang_id = b.id), 0)) * 
        COALESCE((SELECT AVG(bm.harga_satuan) FROM barang_masuks bm WHERE bm.barang_id = b.id), 0)
      ), 0) as total_nilai
      FROM barangs b
    `);
    
    // Barang masuk hari ini
    const [masukHariIni] = await db.query(`
      SELECT COUNT(*) as total, COALESCE(SUM(jumlah), 0) as jumlah
      FROM barang_masuks
      WHERE DATE(tanggal_masuk) = CURDATE()
    `);
    
    // Barang keluar hari ini
    const [keluarHariIni] = await db.query(`
      SELECT COUNT(*) as total, COALESCE(SUM(jumlah), 0) as jumlah
      FROM barang_keluars
      WHERE DATE(tanggal_keluar) = CURDATE()
    `);
    
    // Stok kritikal (below minimal)
    const [stokKritikal] = await db.query(`
      SELECT b.id, b.kode, b.nama, b.satuan, b.minimal_stok,
        COALESCE((SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = b.id), 0) -
        COALESCE((SELECT SUM(bk.jumlah) FROM barang_keluars bk WHERE bk.barang_id = b.id), 0) as stok_sekarang
      FROM barangs b
      WHERE b.minimal_stok > 0 AND
        COALESCE((SELECT SUM(bm.jumlah) FROM barang_masuks bm WHERE bm.barang_id = b.id), 0) -
        COALESCE((SELECT SUM(bk.jumlah) FROM barang_keluars bk WHERE bk.barang_id = b.id), 0) <= b.minimal_stok
      ORDER BY stok_sekarang ASC
      LIMIT 10
    `);
    
    // Akan expired (7 hari)
    const [akanExpired] = await db.query(`
      SELECT bm.id, b.nama as barang_nama, bm.batch_number, bm.tanggal_kadaluarsa,
        COALESCE(bm.jumlah - COALESCE((SELECT SUM(ft.jumlah) FROM fifo_transactions ft JOIN barang_keluars bk ON ft.barang_keluar_id = bk.id WHERE ft.barang_masuk_id = bm.id), 0), 0) as sisa,
        DATEDIFF(bm.tanggal_kadaluarsa, CURDATE()) as hari
      FROM barang_masuks bm
      JOIN barangs b ON bm.barang_id = b.id
      WHERE bm.tanggal_kadaluarsa IS NOT NULL
      AND bm.tanggal_kadaluarsa > CURDATE()
      AND DATEDIFF(bm.tanggal_kadaluarsa, CURDATE()) <= 7
      ORDER BY bm.tanggal_kadaluarsa ASC
      LIMIT 10
    `);
    
    // Movement chart (7 hari terakhir)
    const [movementChart] = await db.query(`
      SELECT 
        DATE(tanggal_masuk) as tanggal,
        (SELECT SUM(jumlah) FROM barang_masuks WHERE DATE(tanggal_masuk) = DATE(tanggal_masuk)) as masuk
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) as tanggal
        FROM (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) t
      ) dates
      LEFT JOIN barang_masuks bm ON DATE(bm.tanggal_masuk) = dates.tanggal
      GROUP BY dates.tanggal
      ORDER BY dates.tanggal ASC
    `);
    
    const [keluarChart] = await db.query(`
      SELECT DATE(tanggal_keluar) as tanggal, SUM(jumlah) as keluar
      FROM barang_keluars
      WHERE tanggal_keluar >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(tanggal_keluar)
      ORDER BY tanggal ASC
    `);
    
    res.json({
      total_barang: totalBarang[0].total,
      total_nilai_stok: nilaiStok[0].total_nilai,
      masuk_hari_ini: { total: masukHariIni[0].total, jumlah: masukHariIni[0].jumlah },
      keluar_hari_ini: { total: keluarHariIni[0].total, jumlah: keluarHariIni[0].jumlah },
      stok_kritikal: stokKritikal,
      akan_expired: akanExpired,
      movement_chart: { masuk: movementChart, keluar: keluarChart }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;