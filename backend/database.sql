-- Database: inventory_cafe
CREATE DATABASE IF NOT EXISTS inventory_cafe;
USE inventory_cafe;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role ENUM('admin', 'staff', 'owner') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT INTO users (username, password, nama_lengkap, role) VALUES 
('admin', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Administrator', 'admin'),
('staff', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Staff Gudang', 'staff')
ON DUPLICATE KEY UPDATE username=username;

-- Table: kategoris
CREATE TABLE IF NOT EXISTS kategoris (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO kategoris (nama, icon, color) VALUES 
('Minuman', '🍵', '#D97706'),
('Makanan', '🍰', '#10B981'),
('Bahan Pokok', '📦', '#6B7280'),
('Topping', '🧊', '#F59E0B')
ON DUPLICATE KEY UPDATE nama=nama;

-- Table: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(100),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: barangs
CREATE TABLE IF NOT EXISTS barangs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  kategori_id INT,
  satuan VARCHAR(20) NOT NULL,
  minimal_stok INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategoris(id) ON DELETE SET NULL
);

-- Table: barang_masuks (FIFO batches)
CREATE TABLE IF NOT EXISTS barang_masuks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barang_id INT NOT NULL,
  supplier_id INT,
  user_id INT NOT NULL,
  batch_number VARCHAR(30) NOT NULL,
  jumlah INT NOT NULL,
  harga_satuan DECIMAL(12,2) NOT NULL,
  tanggal_masuk DATE NOT NULL,
  tanggal_kadaluarsa DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barang_id) REFERENCES barangs(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: barang_keluars
CREATE TABLE IF NOT EXISTS barang_keluars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barang_id INT NOT NULL,
  user_id INT NOT NULL,
  jumlah INT NOT NULL,
  tanggal_keluar DATE NOT NULL,
  keterangan VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barang_id) REFERENCES barangs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: fifo_transactions (FIFO detail)
CREATE TABLE IF NOT EXISTS fifo_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barang_keluar_id INT NOT NULL,
  barang_masuk_id INT NOT NULL,
  jumlah INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barang_keluar_id) REFERENCES barang_keluars(id) ON DELETE CASCADE,
  FOREIGN KEY (barang_masuk_id) REFERENCES barang_masuks(id) ON DELETE CASCADE
);

-- Table: laporan (saved reports)
CREATE TABLE IF NOT EXISTS laporan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  periode VARCHAR(20) NOT NULL,
  tipe ENUM('stok', 'expired', 'fifo', 'movement') NOT NULL,
  data_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);