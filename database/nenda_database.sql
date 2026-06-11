-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 19, 2025 at 04:13 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fairytale_campground`
--

-- --------------------------------------------------------

--
-- Table structure for table `detail_pemesanan`
--

CREATE TABLE `detail_pemesanan` (
  `detail_id` int(10) UNSIGNED NOT NULL,
  `pemesanan_id` int(10) UNSIGNED NOT NULL,
  `tent_id` int(11) UNSIGNED NOT NULL,
  `harga_per_malam` int(10) NOT NULL,
  `subtotal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paket`
--

CREATE TABLE `paket` (
  `paket_id` int(11) UNSIGNED NOT NULL,
  `nama_paket` varchar(50) NOT NULL,
  `deskripsi` text NOT NULL,
  `fasilitas` text NOT NULL,
  `kapasitas` int(10) NOT NULL,
  `harga` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paket`
--

INSERT INTO `paket` (`paket_id`, `nama_paket`, `deskripsi`, `fasilitas`, `kapasitas`, `harga`) VALUES
(1, 'single', 'Tenda ukuran kecil yang dirancang untuk solo traveler atau tamu yang ingin menikmati ketenangan pribadi. Lokasinya ditempatkan di area yang lebih private dan dekat dengan titik sunrise/sunset.', '•⁠  ⁠1 sleeping pad atau matras single\r\n•⁠  ⁠1 sleeping bag\r\n•⁠  ⁠Lampu tenda LED\r\n•⁠  ⁠Meja kecil lipat\r\n•⁠  ⁠Akses area api unggun umum\r\n•⁠  ⁠Free refill air minum\r\n•⁠  ⁠Charging station di area bersama\r\n•⁠  ⁠Toilet & kamar mandi umum\r\n', 1, 150000),
(2, 'double', 'Tenda medium dengan ruang lebih luas, cocok untuk pasangan, sahabat, atau dua orang yang ingin camping dengan lebih lega. Area tendanya berada dekat jalur utama dan fasilitas umum.', '•⁠  ⁠2 sleeping pad atau 1 matras double\r\n•⁠  ⁠2 sleeping bag\r\n•⁠  ⁠Lampu tenda LED\r\n•⁠  ⁠Meja & kursi camping\r\n•⁠  ⁠Area api unggun bersama\r\n•⁠  ⁠Free refill air minum\r\n•⁠  ⁠Charging station di area bersama\r\n•⁠  ⁠Toilet & kamar mandi umum\r\n', 2, 250000),
(3, 'family', 'Tenda besar dengan ruang keluarga, ideal untuk rombongan kecil atau keluarga yang ingin menginap dengan lebih nyaman. Tenda ini memiliki ventilasi besar dan area di sekitar tenda cukup luas untuk aktivitas outdoor ringan.', '•⁠  ⁠Matras sesuai kapasitas (queen + single / 4 sleeping pad)\r\n•⁠  ⁠4 sleeping bag\r\n•⁠  ⁠Lampu tenda LED tambahan\r\n•⁠  ⁠Meja piknik + kursi lipat\r\n•⁠  ⁠Area api unggun khusus family\r\n•⁠  ⁠Free refill air minum\r\n•⁠  ⁠Charging station di area bersama\r\n•⁠  ⁠Toilet & kamar mandi umum dengan beberapa shower room\r\n', 4, 400000);

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `pembayaran_id` int(10) UNSIGNED NOT NULL,
  `pemesanan_id` int(10) UNSIGNED NOT NULL,
  `total_pembayaran` int(11) NOT NULL,
  `status_pembayaran` enum('menunggu_verifikasi','diterima','ditolak') NOT NULL DEFAULT 'menunggu_verifikasi',
  `tanggal_pembayaran` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bukti_tf` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pemesanan_master`
--

CREATE TABLE `pemesanan_master` (
  `pemesanan_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `tanggal_checkin` date NOT NULL,
  `tanggal_checkout` date NOT NULL,
  `total_harga` int(11) NOT NULL,
  `status_pemesanan` enum('menunggu_pembayaran','menunggu_konfirmasi','telah_dibayar','expired','dibatalkan') NOT NULL DEFAULT 'menunggu_pembayaran',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expired_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tent`
--

CREATE TABLE `tent` (
  `tent_id` int(11) UNSIGNED NOT NULL,
  `paket_id` int(11) UNSIGNED NOT NULL,
  `nomor_tent` varchar(10) NOT NULL,
  `nomor_loker` varchar(10) NOT NULL,
  `status` enum('tersedia','tidak tersedia') NOT NULL DEFAULT 'tersedia'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tent`
--

INSERT INTO `tent` (`tent_id`, `paket_id`, `nomor_tent`, `nomor_loker`, `status`) VALUES
(1, 1, 'S01', 'LS01', 'tersedia'),
(2, 1, 'S02', 'LS02', 'tersedia'),
(3, 1, 'S03', 'LS03', 'tersedia'),
(4, 1, 'S04', 'LS04', 'tersedia'),
(5, 1, 'S05', 'LS05', 'tersedia'),
(6, 1, 'S06', 'LS06', 'tersedia'),
(7, 1, 'S07', 'LS07', 'tersedia'),
(8, 1, 'S08', 'LS08', 'tersedia'),
(9, 1, 'S09', 'LS09', 'tersedia'),
(10, 1, 'S10', 'LS10', 'tersedia'),
(11, 2, 'D01', 'LD01', 'tersedia'),
(12, 2, 'D02', 'LD02', 'tersedia'),
(13, 2, 'D03', 'LD03', 'tersedia'),
(14, 2, 'D04', 'LD04', 'tersedia'),
(15, 2, 'D05', 'LD05', 'tersedia'),
(16, 2, 'D06', 'LD06', 'tersedia'),
(17, 2, 'D07', 'LD07', 'tersedia'),
(18, 2, 'D08', 'LD08', 'tersedia'),
(19, 2, 'D09', 'LD09', 'tersedia'),
(20, 2, 'D10', 'LD10', 'tersedia'),
(21, 3, 'F01', 'LF01', 'tersedia'),
(22, 3, 'F02', 'LF02', 'tersedia'),
(23, 3, 'F03', 'LF03', 'tersedia'),
(24, 3, 'F04', 'LF04', 'tersedia'),
(25, 3, 'F05', 'LF05', 'tersedia'),
(26, 3, 'F06', 'LF06', 'tersedia'),
(27, 3, 'F07', 'LF07', 'tersedia'),
(28, 3, 'F08', 'LF08', 'tersedia'),
(29, 3, 'F09', 'LF09', 'tersedia'),
(30, 3, 'F10', 'LF10', 'tersedia'),
(31, 3, 'F11', 'LF11', 'tersedia'),
(32, 3, 'F12', 'LF12', 'tersedia'),
(33, 3, 'F13', 'LF13', 'tersedia'),
(34, 3, 'F14', 'LF14', 'tersedia'),
(35, 3, 'F15', 'LF15', 'tersedia'),
(36, 3, 'F16', 'LF16', 'tersedia'),
(37, 3, 'F17', 'LF17', 'tersedia'),
(38, 3, 'F18', 'LF18', 'tersedia'),
(39, 3, 'F19', 'LF19', 'tersedia'),
(40, 3, 'F20', 'LF20', 'tersedia');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) UNSIGNED NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detail_pemesanan`
--
ALTER TABLE `detail_pemesanan`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `fk_detail_pemesanan_master` (`pemesanan_id`),
  ADD KEY `fk_detail_tent` (`tent_id`);

--
-- Indexes for table `paket`
--
ALTER TABLE `paket`
  ADD PRIMARY KEY (`paket_id`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`pembayaran_id`),
  ADD KEY `fk_pembayaran_pemesanan` (`pemesanan_id`);

--
-- Indexes for table `pemesanan_master`
--
ALTER TABLE `pemesanan_master`
  ADD PRIMARY KEY (`pemesanan_id`),
  ADD KEY `fk_pemesanan_user` (`user_id`);

--
-- Indexes for table `tent`
--
ALTER TABLE `tent`
  ADD PRIMARY KEY (`tent_id`),
  ADD KEY `fk_camp_paket` (`paket_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detail_pemesanan`
--
ALTER TABLE `detail_pemesanan`
  MODIFY `detail_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paket`
--
ALTER TABLE `paket`
  MODIFY `paket_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `pembayaran_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pemesanan_master`
--
ALTER TABLE `pemesanan_master`
  MODIFY `pemesanan_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tent`
--
ALTER TABLE `tent`
  MODIFY `tent_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_pemesanan`
--
ALTER TABLE `detail_pemesanan`
  ADD CONSTRAINT `fk_detail_pemesanan_master` FOREIGN KEY (`pemesanan_id`) REFERENCES `pemesanan_master` (`pemesanan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_tent` FOREIGN KEY (`tent_id`) REFERENCES `tent` (`tent_id`) ON UPDATE CASCADE;

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `fk_pembayaran_pemesanan` FOREIGN KEY (`pemesanan_id`) REFERENCES `pemesanan_master` (`pemesanan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pemesanan_master`
--
ALTER TABLE `pemesanan_master`
  ADD CONSTRAINT `fk_pemesanan_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `tent`
--
ALTER TABLE `tent`
  ADD CONSTRAINT `fk_camp_paket` FOREIGN KEY (`paket_id`) REFERENCES `paket` (`paket_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
