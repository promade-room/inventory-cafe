# PRD - Sistem Inventory Cafe (inventory-cafe)

## 1. Project Overview

**Nama Project:** Sistem Inventory Cafe Andung  
**Subdomain:** http://inventory-cafe.sias.web.id  
**Tech Stack:** React + Express.js + MySQL + TailwindCSS (Tema Flat)

### Latar Belakang
Cafe Andung saat ini mengelola inventory secara manual dengan pencatatan buku/spreadsheet. Hal ini menyebabkan:
- Kesalahan pencatatan stok yang tinggi
- Data stok tidak real-time
- Keterlambatan update data inventory
- Tidak ada mekanisme otomatis untuk FIFO
- Laporan stok tidak akurat

### Solusi
Sistem informasi inventory berbasis web dengan implementasi metode FIFO untuk mengelola persediaan bahan baku cafe.

---

## 2. User Roles

| Role | Hak Akses |
|------|-----------|
| **Admin** | Full access - CRUD semua data, manage user, lihat laporan |
| **Staff Gudang** | Input barang masuk/keluar, lihat stok, notifikasi stok kritis |
| **Pemilik (Owner)** | View dashboard, lihat laporan, notifikasi stok kritis |

---

## 3. Fitur Utama

### 3.1 Authentication & Authorization
- Login dengan username/password
- JWT token untuk API security
- Role-based access control (RBAC)
- Logout

### 3.2 Dashboard
- Total item barang
- Total nilai stok
- Grafik pergerakan stok (barang masuk vs keluar)
- Tabel peringatan stok menipis (below min threshold)
- Notifikasi barang mendekati expired
- Quick stats: barang masuk hari ini, barang keluar hari ini

### 3.3 Master Data

#### 3.3.1 Kategori Barang
- CRUD kategori (Minuman, Makanan, Bahan Pokok, etc.)
- Icon/kategori color

#### 3.3.2 Data Barang (Master)
- Kode barang, Nama barang
- Kategori
- Satuan (pcs, gram, liter, pack)
- Stok saat ini (auto-calculated)
- Minimal stok (threshold for alerts)
- Harga rata-rata (auto-calculated from FIFO)
- Tanggal kadaluarsa (untuk batch terkecil)

#### 3.3.3 Supplier
- Nama supplier
- Alamat
- No. telepon
- Email
- Catatan

#### 3.3.4 User Management
- CRUD user
- Assign role (Admin/Staff/Owner)
- Reset password

### 3.4 Transaksi Inventory (FIFO Implementation)

#### 3.4.1 Barang Masuk
- Pilih barang
- Input jumlah
- Input harga per unit
- Tanggal masuk (auto: today, bisa edit)
- Tanggal kadaluarsa (optional - untuk barang expire)
- Pilih supplier
- Batch number (auto-generated)
- **Sistem自动 generate batch dan simpan berdasarkan tanggal masuk**

#### 3.4.2 Barang Keluar / Penggunaan
- Pilih barang
- Input jumlah yang keluar
- Tanggal keluar
- Keterangan/keperluan (Produksi, Rusak, Sampling, dll)
- **Sistem FIFO: otomatis kurangi dari batch tertua (tgl masuk paling awal)**
- Validasi: tidak bisa melebihi total stok tersedia

#### 3.4.3 FIFO Logic Detail
```
1. Ambil semua batch barang yang ada, urutkan ASC berdasarkan tanggal_masuk
2. Kurangi dari batch pertama
3. Jika batch pertama habis, lanjut ke batch berikutnya
4. Simpan histori setiap pemotongan (batch_id, jumlah, tanggal)
```

### 3.5 Monitoring Stok

#### 3.5.1 Stok Realtime
- Tabel semua barang dengan stok saat ini
- Filter by kategori
- Search by nama barang
- Kolom: Kode, Nama, Kategori, Stok, Satuan, Avg Price, Total Nilai, Tgl Expired (nearest batch)

#### 3.5.2 Detail Batch View
- Klik barang → lihat semua batch
- Kolom: Batch#, Tanggal Masuk, Jumlah Awal, Sisa, Tanggal Kadaluarsa
- Visual: warna hijau untuk batch aman, kuning untuk akan expired (<7 hari), merah untuk expired

#### 3.5.3 Stok Kritikal
- List barang yang di bawah minimal stok
- Notifikasi ke owner via dashboard

### 3.6 Laporan

#### 3.6.1 Laporan Stok
- Periode: bulanan/tahunan
- Kolom: Kode, Nama, Stok Awal, Masuk, Keluar, Sisa, Nilai
- Export ke PDF/Excel

#### 3.6.2 Laporan Barang Expired
- Semua batch yang sudah/t接近 kadaluarsa
- Tanggal expired, jumlah, nilairugi potensial

#### 3.6.3 Laporan FIFO
- Riwayat pergerakan per batch
- Bukti bahwa stok lama keluar dulu

#### 3.6.4 Laporan Movement
- Grafik line chart: stok masuk vs keluar per hari/minggu/bulan
- Top 10 barang paling banyak keluar

### 3.7 Settings
- Profile user
- Change password
- Pengaturan minimal stok default

---

## 4. Additional Fitur (Enhancement)

### 4.1 Notifikasi & Alerts
- Alert stok di bawah minimal (via dashboard - refresh manual)
- Alert barang expired dalam 7 hari (via dashboard - refresh manual)

### 4.2 History & Audit Trail
- Log semua transaksi (who, when, what)
- History perubahan data master

### 4.3 Search & Filter Global
- Search across all tables
- Filter by date range, kategori, status

### 4.4 Import/Export
- Import data barang dari Excel
- Export laporan ke CSV/Excel

---

## 5. Database Schema (ERD Style)

### 5.1 Tables

**users**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) NOT NULL UNIQUE | Username login |
| password | VARCHAR(255) NOT NULL | Password (hashed) |
| nama_lengkap | VARCHAR(100) NOT NULL | Nama lengkap user |
| role | ENUM('admin','staff','owner') NOT NULL | Role pengguna |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

**kategoris**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| nama | VARCHAR(50) NOT NULL | Nama kategori |
| icon | VARCHAR(50) | Icon (nullable) |
| color | VARCHAR(20) | Warna hex (nullable) |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |

**barangs**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| kode | VARCHAR(20) NOT NULL UNIQUE | Kode barang |
| nama | VARCHAR(100) NOT NULL | Nama barang |
| kategori_id | INT FK → kategoris(id) | Relasi kategori |
| satuan | VARCHAR(20) NOT NULL | pcs, gram, liter, pack |
| minimal_stok | INT DEFAULT 0 | Threshold stok kritis |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

**suppliers**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| nama | VARCHAR(100) NOT NULL | Nama supplier |
| alamat | TEXT | Alamat lengkap (nullable) |
| telepon | VARCHAR(20) | No. telepon (nullable) |
| email | VARCHAR(100) | Email (nullable) |
| catatan | TEXT | Catatan (nullable) |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

**barang_masuks**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| barang_id | INT FK → barangs(id) | Relasi barang |
| supplier_id | INT FK → suppliers(id) | Relasi supplier |
| user_id | INT FK → users(id) | User yang input |
| batch_number | VARCHAR(30) NOT NULL | No. batch (auto generated) |
| jumlah | INT NOT NULL | Jumlah masuk |
| harga_satuan | DECIMAL(12,2) NOT NULL | Harga per unit |
| tanggal_masuk | DATE NOT NULL | Tanggal masuk |
| tanggal_kadaluarsa | DATE | Tgl kadaluarsa (nullable) |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |

**barang_keluars**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| barang_id | INT FK → barangs(id) | Relasi barang |
| user_id | INT FK → users(id) | User yang input |
| jumlah | INT NOT NULL | Jumlah keluar |
| tanggal_keluar | DATE NOT NULL | Tanggal keluar |
| keterangan | VARCHAR(200) | Keperluan/keadaan (nullable) |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |

**fifo_transactions**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| barang_keluar_id | INT FK → barang_keluars(id) | Transaksi keluar |
| barang_masuk_id | INT FK → barang_masuks(id) | Batch yang dipotong |
| jumlah | INT NOT NULL | Jumlah dipotong |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |

**laporans**
| Field | Type | Note |
|-------|------|------|
| id | INT PK AUTO_INCREMENT | |
| periode | VARCHAR(20) NOT NULL | Bulan/Tahun |
| tipe | ENUM('stok','expired','fifo','movement') NOT NULL | Jenis laporan |
| data_json | JSON | Data laporan (nullable) |
| created_at | TIMESTAMP | Default CURRENT_TIMESTAMP |

---

## 6. API Endpoints (Express.js)

### Auth
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Users
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- POST /api/users/reset-password

### Kategori
- GET /api/kategori
- POST /api/kategori
- PUT /api/kategori/:id
- DELETE /api/kategori/:id

### Barang
- GET /api/barang
- GET /api/barang/:id
- POST /api/barang
- PUT /api/barang/:id
- DELETE /api/barang/:id
- GET /api/barang/:id/batches

### Supplier
- GET /api/suppliers
- POST /api/suppliers
- PUT /api/suppliers/:id
- DELETE /api/suppliers/:id

### Transaksi
- GET /api/masuk
- POST /api/masuk
- GET /api/keluar
- POST /api/keluar

### Laporan
- GET /api/laporan/stok
- GET /api/laporan/expired
- GET /api/laporan/movement

### Dashboard
- GET /api/dashboard/stats

---

## 7. UI/UX Guidelines

### Tema: Flat Design (Coffee Shop Theme - Silver Orange)

**Color Palette:**
- Primary: #D97706 (Amber/Orange - kopi)
- Secondary: #6B7280 (Gray silver)
- Accent: #F59E0B (Orange)
- Background: #F3F4F6 (Light gray)
- Card: #FFFFFF (White)
- Text: #1F2937 (Dark gray)
- Success/Stok Aman: #10B981 (Green)
- Warning/Stok Kritis: #F59E0B (Amber)
- Danger/Expired: #EF4444 (Red)

**Coffee Shop Vibes:**
- Dominan silver/gray dengan accent orange kopi
- Clean, modern flat design
- Warm but professional

**Typography:**
- Font: Inter / Poppins
- Headings: Bold, 18-24px
- Body: Regular, 14-16px

**Layout:**
- Sidebar navigation (collapsible on mobile)
- Main content area with cards
- Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- Tables with pagination
- Forms with clear labels

---

## 8. Acceptance Criteria

1. ✅ User dapat login dengan role yang sesuai
2. ✅ Admin dapat CRUD semua master data
3. ✅ Staff dapat input barang masuk dengan FIFO batch generation
4. ✅ Staff dapat input barang keluar dengan automatic FIFO selection
5. ✅ Sistem tidak bisa output lebih dari total stok
6. ✅ Dashboard menampilkan stats real-time
7. ✅ Notifikasi muncul untuk stok di bawah minimal
8. ✅ Laporan bisa di-export
9. ✅ UI responsive di mobile dan desktop
10. ✅ Tema flat dengan TailwindCSS

---

## 9. Tech Details

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Express.js + MySQL (mysql2)
- **Auth:** JWT + bcrypt
- **API:** RESTful
- **Deployment:**
  - Backend: PM2 + Node.js
  - Frontend: Nginx (static build)