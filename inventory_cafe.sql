/*
 Navicat Premium Dump SQL

 Source Server         : LOKO Dev OpenClaw
 Source Server Type    : MySQL
 Source Server Version : 80028 (8.0.28)
 Source Host           : 103.127.99.28:3306
 Source Schema         : inventory_cafe

 Target Server Type    : MySQL
 Target Server Version : 80028 (8.0.28)
 File Encoding         : 65001

 Date: 12/05/2026 07:16:18
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for barang_keluars
-- ----------------------------
DROP TABLE IF EXISTS `barang_keluars`;
CREATE TABLE `barang_keluars`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `user_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `tanggal_keluar` date NOT NULL,
  `keterangan` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `barang_id`(`barang_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `barang_keluars_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barangs` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `barang_keluars_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of barang_keluars
-- ----------------------------
INSERT INTO `barang_keluars` VALUES (1, 1, 7, 20, '2026-03-28', 'Produksi', '2026-04-03 23:39:28');
INSERT INTO `barang_keluars` VALUES (2, 3, 7, 30, '2026-03-30', 'Produksi', '2026-04-03 23:39:28');
INSERT INTO `barang_keluars` VALUES (3, 5, 7, 10, '2026-03-29', 'Produksi', '2026-04-03 23:39:28');
INSERT INTO `barang_keluars` VALUES (4, 11, 7, 25, '2026-04-01', 'Produksi', '2026-04-03 23:39:28');
INSERT INTO `barang_keluars` VALUES (5, 1, 8, 15, '2026-04-02', 'Produksi', '2026-04-03 23:39:28');

-- ----------------------------
-- Table structure for barang_masuks
-- ----------------------------
DROP TABLE IF EXISTS `barang_masuks`;
CREATE TABLE `barang_masuks`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `supplier_id` int NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `batch_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jumlah` int NOT NULL,
  `harga_satuan` decimal(12, 2) NOT NULL,
  `tanggal_masuk` date NOT NULL,
  `tanggal_kadaluarsa` date NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `barang_id`(`barang_id` ASC) USING BTREE,
  INDEX `supplier_id`(`supplier_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `barang_masuks_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barangs` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `barang_masuks_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `barang_masuks_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of barang_masuks
-- ----------------------------
INSERT INTO `barang_masuks` VALUES (11, 1, 1, 7, 'BM-2026-0401-001', 50, 85000.00, '2026-03-15', '2026-09-15', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (12, 1, 1, 7, 'BM-2026-0401-002', 30, 87000.00, '2026-03-25', '2026-09-25', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (13, 2, 1, 7, 'BM-2026-0401-003', 40, 65000.00, '2026-03-20', '2026-08-20', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (14, 3, 2, 7, 'BM-2026-0401-004', 100, 12000.00, '2026-03-28', '2026-05-28', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (15, 3, 2, 7, 'BM-2026-0401-005', 50, 12500.00, '2026-04-01', '2026-06-01', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (16, 5, 3, 7, 'BM-2026-0401-006', 30, 15000.00, '2026-03-10', NULL, '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (17, 6, 3, 7, 'BM-2026-0401-007', 20, 35000.00, '2026-03-18', NULL, '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (18, 7, 1, 7, 'BM-2026-0401-008', 15, 45000.00, '2026-03-22', '2026-12-22', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (19, 8, 1, 7, 'BM-2026-0401-009', 12, 42000.00, '2026-03-26', '2026-12-26', '2026-04-03 23:39:14');
INSERT INTO `barang_masuks` VALUES (20, 11, 1, 7, 'BM-2026-0401-010', 50, 8000.00, '2026-04-01', '2026-04-15', '2026-04-03 23:39:14');

-- ----------------------------
-- Table structure for barangs
-- ----------------------------
DROP TABLE IF EXISTS `barangs`;
CREATE TABLE `barangs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `kategori_id` int NULL DEFAULT NULL,
  `satuan` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `minimal_stok` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `kode`(`kode` ASC) USING BTREE,
  INDEX `kategori_id`(`kategori_id` ASC) USING BTREE,
  CONSTRAINT `barangs_ibfk_1` FOREIGN KEY (`kategori_id`) REFERENCES `kategoris` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of barangs
-- ----------------------------
INSERT INTO `barangs` VALUES (1, 'KOPI001', 'Biji Kopi Arabica', 1, 'kg', 10, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (2, 'KOPI002', 'Biji Kopi Robusta', 1, 'kg', 10, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (3, 'SUSU001', 'Susu UHT Full Cream', 2, 'liter', 20, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (4, 'SUSU002', 'Susu Evaporated', 2, 'kaleng', 15, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (5, 'GULA001', 'Gula Pasir', 3, 'kg', 15, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (6, 'GULA002', 'Gula Aren', 3, 'kg', 10, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (7, 'SYRUP001', 'Syrup Caramel', 4, 'botol', 8, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (8, 'SYRUP002', 'Syrup Vanilla', 4, 'botol', 8, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (9, 'SYRUP003', 'Syrup Hazelnut', 4, 'botol', 5, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (10, 'TOPP001', 'Whipped Cream', 4, 'pack', 10, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (11, 'SNACK001', 'Kentang Goreng', 5, 'pack', 20, '2026-04-03 23:38:22', '2026-04-03 23:38:22');
INSERT INTO `barangs` VALUES (12, 'SNACK002', 'Croissant', 5, 'pcs', 15, '2026-04-03 23:38:22', '2026-04-03 23:38:22');

-- ----------------------------
-- Table structure for fifo_transactions
-- ----------------------------
DROP TABLE IF EXISTS `fifo_transactions`;
CREATE TABLE `fifo_transactions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_keluar_id` int NOT NULL,
  `barang_masuk_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `barang_keluar_id`(`barang_keluar_id` ASC) USING BTREE,
  INDEX `barang_masuk_id`(`barang_masuk_id` ASC) USING BTREE,
  CONSTRAINT `fifo_transactions_ibfk_1` FOREIGN KEY (`barang_keluar_id`) REFERENCES `barang_keluars` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fifo_transactions_ibfk_2` FOREIGN KEY (`barang_masuk_id`) REFERENCES `barang_masuks` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fifo_transactions
-- ----------------------------

-- ----------------------------
-- Table structure for kategoris
-- ----------------------------
DROP TABLE IF EXISTS `kategoris`;
CREATE TABLE `kategoris`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kategoris
-- ----------------------------
INSERT INTO `kategoris` VALUES (1, 'Minuman', '🍵', '#D97706', '2026-04-03 23:24:39');
INSERT INTO `kategoris` VALUES (2, 'Makanan', '🍰', '#10B981', '2026-04-03 23:24:39');
INSERT INTO `kategoris` VALUES (3, 'Bahan Pokok', '📦', '#6B7280', '2026-04-03 23:24:39');
INSERT INTO `kategoris` VALUES (4, 'Topping', '🧊', '#F59E0B', '2026-04-03 23:24:39');
INSERT INTO `kategoris` VALUES (5, 'Minuman', '☕', '#D97706', '2026-04-03 23:38:14');
INSERT INTO `kategoris` VALUES (6, 'Makanan', '🍰', '#10B981', '2026-04-03 23:38:14');
INSERT INTO `kategoris` VALUES (7, 'Bahan Pokok', '📦', '#6B7280', '2026-04-03 23:38:14');
INSERT INTO `kategoris` VALUES (8, 'Topping', '🧊', '#F59E0B', '2026-04-03 23:38:14');
INSERT INTO `kategoris` VALUES (9, 'Snack', '🍟', '#EF4444', '2026-04-03 23:38:14');

-- ----------------------------
-- Table structure for laporan
-- ----------------------------
DROP TABLE IF EXISTS `laporan`;
CREATE TABLE `laporan`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `periode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tipe` enum('stok','expired','fifo','movement') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `data_json` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of laporan
-- ----------------------------

-- ----------------------------
-- Table structure for suppliers
-- ----------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `alamat` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `telepon` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `catatan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of suppliers
-- ----------------------------
INSERT INTO `suppliers` VALUES (1, 'PT Indo Kopi Jaya', 'Jl. Raya Kopi No. 123, Jakarta', '021-1234567', 'indokopi@email.com', 'Supplier biji kopi premium', '2026-04-03 23:38:14', '2026-04-03 23:38:14');
INSERT INTO `suppliers` VALUES (2, 'CV Sumber Susu', 'Jl. Susu Raya No. 45, Bandung', '022-7654321', 'sumbersusu@email.com', 'Supplier susu segar', '2026-04-03 23:38:14', '2026-04-03 23:38:14');
INSERT INTO `suppliers` VALUES (3, 'Toko Gula Madu', 'Jl. Manis No. 78, Surabaya', '031-9876543', 'gulamadu@email.com', 'Supplier gula dan pemanis', '2026-04-03 23:38:14', '2026-04-03 23:38:14');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nama_lengkap` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('admin','staff','owner') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'staff',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (7, 'admin', '$2a$10$vXV89ZSHlKREiqk6hrouCeANwZXUILOT6qqiLWRo6qDyYx2IaMRpm', 'Administrator', 'admin', '2026-04-03 23:38:05', '2026-04-03 23:41:01');
INSERT INTO `users` VALUES (8, 'staff', '$2a$10$kpNvo7pam5htrCnlS/PGCOmrAVOOoow2110H.P.20oamX7.iBlICu', 'Staff Gudang', 'staff', '2026-04-03 23:38:05', '2026-04-03 23:41:39');
INSERT INTO `users` VALUES (9, 'owner', '$2a$10$kpNvo7pam5htrCnlS/PGCOmrAVOOoow2110H.P.20oamX7.iBlICu', 'Pemilik Cafe', 'owner', '2026-04-03 23:38:05', '2026-04-03 23:41:39');

SET FOREIGN_KEY_CHECKS = 1;
