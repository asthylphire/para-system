-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2026 at 02:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `para_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `favorite_routes`
--

CREATE TABLE `favorite_routes` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `label` varchar(100) NOT NULL,
  `origin_name` varchar(200) NOT NULL,
  `origin_lat` decimal(9,6) NOT NULL,
  `origin_lng` decimal(9,6) NOT NULL,
  `dest_name` varchar(200) NOT NULL,
  `dest_lat` decimal(9,6) NOT NULL,
  `dest_lng` decimal(9,6) NOT NULL,
  `transport_code` varchar(30) NOT NULL,
  `passenger_code` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorite_routes`
--

INSERT INTO `favorite_routes` (`id`, `user_id`, `label`, `origin_name`, `origin_lat`, `origin_lng`, `dest_name`, `dest_lat`, `dest_lng`, `transport_code`, `passenger_code`, `created_at`) VALUES
(4, 5, 'Tungko → Licao-Licao', 'Tungko', 14.790161, 121.074613, 'Licao-Licao', 14.808481, 121.152139, 'traditional_jeepney', 'student', '2026-10-10 20:46:26');

-- --------------------------------------------------------

--
-- Table structure for table `landmarks`
--

CREATE TABLE `landmarks` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` enum('school','hospital','terminal','market','church','park','food','other') NOT NULL DEFAULT 'other',
  `description` text DEFAULT NULL,
  `lat` decimal(9,6) NOT NULL,
  `lng` decimal(9,6) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passenger_types`
--

CREATE TABLE `passenger_types` (
  `code` varchar(20) NOT NULL,
  `label` varchar(40) NOT NULL,
  `discount_rate` decimal(3,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `passenger_types`
--

INSERT INTO `passenger_types` (`code`, `label`, `discount_rate`) VALUES
('pwd', 'PWD', 0.20),
('regular', 'Regular', 0.00),
('senior', 'Senior Citizen', 0.20),
('student', 'Student', 0.20);

-- --------------------------------------------------------

--
-- Table structure for table `transport_types`
--

CREATE TABLE `transport_types` (
  `code` varchar(30) NOT NULL,
  `label` varchar(60) NOT NULL,
  `base_fare` decimal(6,2) NOT NULL,
  `base_km` decimal(4,1) NOT NULL,
  `excess_per_km` decimal(6,2) NOT NULL,
  `avg_speed_kph` decimal(5,2) NOT NULL DEFAULT 20.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transport_types`
--

INSERT INTO `transport_types` (`code`, `label`, `base_fare`, `base_km`, `excess_per_km`, `avg_speed_kph`) VALUES
('bus_aircon', 'Bus (Aircon)', 15.00, 5.0, 2.65, 30.00),
('bus_ordinary', 'Bus (Ordinary)', 13.00, 5.0, 2.20, 25.00),
('modern_jeepney', 'Modern Jeepney', 14.00, 4.0, 2.35, 22.00),
('traditional_jeepney', 'Traditional Jeepney', 13.00, 4.0, 1.80, 20.00);

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `origin_name` varchar(200) NOT NULL,
  `origin_lat` decimal(9,6) NOT NULL,
  `origin_lng` decimal(9,6) NOT NULL,
  `dest_name` varchar(200) NOT NULL,
  `dest_lat` decimal(9,6) NOT NULL,
  `dest_lng` decimal(9,6) NOT NULL,
  `transport_code` varchar(30) NOT NULL,
  `passenger_code` varchar(20) NOT NULL,
  `distance_km` decimal(6,2) NOT NULL,
  `total_fare` decimal(7,2) NOT NULL,
  `duration_min` smallint(5) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `created_at`) VALUES
(5, 'ezekielferrer', 'ezekielzaqueo19@gmail.com', '$2y$10$WR2OKeUODslQKAQlVS7tM.r.poIO0r2yYep/bvNC7b62qrmbUTtzu', '2026-10-10 20:38:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_fav_transport` (`transport_code`),
  ADD KEY `fk_fav_passenger` (`passenger_code`),
  ADD KEY `idx_fav_user` (`user_id`);

--
-- Indexes for table `landmarks`
--
ALTER TABLE `landmarks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_landmarks_user` (`user_id`);

--
-- Indexes for table `passenger_types`
--
ALTER TABLE `passenger_types`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `transport_types`
--
ALTER TABLE `transport_types`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trips_transport` (`transport_code`),
  ADD KEY `fk_trips_passenger` (`passenger_code`),
  ADD KEY `idx_trips_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `landmarks`
--
ALTER TABLE `landmarks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD CONSTRAINT `fk_fav_passenger` FOREIGN KEY (`passenger_code`) REFERENCES `passenger_types` (`code`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fav_transport` FOREIGN KEY (`transport_code`) REFERENCES `transport_types` (`code`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `landmarks`
--
ALTER TABLE `landmarks`
  ADD CONSTRAINT `fk_landmarks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `fk_trips_passenger` FOREIGN KEY (`passenger_code`) REFERENCES `passenger_types` (`code`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trips_transport` FOREIGN KEY (`transport_code`) REFERENCES `transport_types` (`code`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trips_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
