-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2026 at 05:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ledgerlite`
--

-- --------------------------------------------------------

--
-- Table structure for table `savings_cycles`
--

CREATE TABLE `savings_cycles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_income` decimal(10,2) NOT NULL,
  `target_savings` decimal(10,2) NOT NULL,
  `spendable_limit` decimal(10,2) NOT NULL,
  `status` enum('active','completed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `actual_end_date` date DEFAULT NULL,
  `final_saved_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `savings_cycles`
--

INSERT INTO `savings_cycles` (`id`, `user_id`, `start_date`, `end_date`, `total_income`, `target_savings`, `spendable_limit`, `status`, `created_at`, `actual_end_date`, `final_saved_amount`) VALUES
(1, 1, '2026-09-25', '2026-10-25', 2000.00, 500.00, 1500.00, 'active', '2026-09-25 12:11:47', NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `settlements`
--

CREATE TABLE `settlements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `particular` varchar(255) NOT NULL,
  `entry_type` enum('credit','debit') NOT NULL,
  `account_type` enum('bank','cash') NOT NULL,
  `target_date` date NOT NULL,
  `status` enum('pending','cleared') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settlements`
--

INSERT INTO `settlements` (`id`, `user_id`, `amount`, `particular`, `entry_type`, `account_type`, `target_date`, `status`, `created_at`) VALUES
(1, 1, 500.00, 'internet', 'debit', 'bank', '2026-09-26', 'cleared', '2026-09-25 12:12:50');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `particular` varchar(255) NOT NULL,
  `entry_type` enum('credit','debit') NOT NULL,
  `account_type` enum('cash','bank','debt','lent') NOT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `amount`, `particular`, `entry_type`, `account_type`, `transaction_date`, `created_at`) VALUES
(1, 1, 100.00, 'copy', 'debit', 'cash', '2026-09-25', '2026-09-25 12:11:27'),
(2, 1, 200.00, 'biriyani', 'debit', 'bank', '2026-09-25', '2026-09-25 12:12:14'),
(3, 1, 500.00, 'internet', 'debit', 'bank', '2026-09-25', '2026-09-25 12:13:08'),
(4, 1, 700.00, 'mom send', 'credit', 'bank', '2026-09-25', '2026-09-25 12:13:37'),
(5, 1, 20.00, 'a', 'credit', 'bank', '2026-09-26', '2026-09-25 14:12:42'),
(6, 1, 30.00, 'b', 'credit', 'bank', '2026-09-27', '2026-09-25 14:12:54'),
(7, 1, 500.00, 'grocery', 'debit', 'bank', '2026-09-24', '2026-09-25 14:17:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Avirup Mukherjee', 'avirup@gmail.com', '$2y$10$fQZ6xajIYEcjqUHwNXI/b.u8Cyo21jVxbivOd3MPvlmcFYsnqPRLq', '2026-09-22 18:10:57'),
(2, 'Ritankar Mandal', 'ritankar@gmail.com', '$2y$10$ebjrGoZLQIycuZ9V6jZgbOf/gaoCgMoinYAQtQsy7jOFe2u4fy5y2', '2026-09-24 03:06:45'),
(3, 'Shouvik Mandal', 'shouvik@gmail.com', '$2y$10$CtMRhUBsk0wPyiiu1naYU.McUYT7//Zxi7RaFXLy8F0.0Ge89mE6.', '2026-09-24 11:10:09');

-- --------------------------------------------------------

--
-- Table structure for table `user_balances`
--

CREATE TABLE `user_balances` (
  `user_id` int(11) NOT NULL,
  `cash_opening` decimal(15,2) DEFAULT 0.00,
  `bank_opening` decimal(15,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_balances`
--

INSERT INTO `user_balances` (`user_id`, `cash_opening`, `bank_opening`, `updated_at`) VALUES
(1, 5000.00, 10000.00, '2026-09-25 12:11:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `savings_cycles`
--
ALTER TABLE `savings_cycles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `settlements`
--
ALTER TABLE `settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_balances`
--
ALTER TABLE `user_balances`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `savings_cycles`
--
ALTER TABLE `savings_cycles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settlements`
--
ALTER TABLE `settlements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `savings_cycles`
--
ALTER TABLE `savings_cycles`
  ADD CONSTRAINT `savings_cycles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `settlements`
--
ALTER TABLE `settlements`
  ADD CONSTRAINT `settlements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_balances`
--
ALTER TABLE `user_balances`
  ADD CONSTRAINT `user_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
