-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2026 at 08:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rot_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cars_check`
--

CREATE TABLE `cars_check` (
  `id` int(11) NOT NULL,
  `launch_car_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `available_sit` int(11) DEFAULT 0,
  `expired_total_ticket` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cars_check`
--

INSERT INTO `cars_check` (`id`, `launch_car_id`, `location_id`, `available_sit`, `expired_total_ticket`, `created_at`) VALUES
(1, 1, 1, 1, 0, '2026-05-16 06:52:08'),
(2, 1, 1, 29, 0, '2026-05-16 06:52:08'),
(3, 3, 2, 1, 0, '2026-05-18 09:57:42'),
(4, 3, 2, 29, 0, '2026-05-18 09:57:42'),
(5, 2, 1, 1, 0, '2026-05-18 10:09:27'),
(6, 2, 1, 44, 0, '2026-05-18 10:09:27'),
(7, 1, 1, 1, 1, '2026-05-18 12:17:49'),
(8, 1, 1, 29, 1, '2026-05-18 12:17:49'),
(9, 6, 2, 1, 0, '2026-05-18 15:31:46'),
(10, 6, 2, 3, 0, '2026-05-18 15:31:46'),
(11, 4, 3, 1, 0, '2026-05-18 16:48:29'),
(12, 4, 3, 44, 0, '2026-05-18 16:48:29'),
(13, 5, 4, 1, 0, '2026-05-18 16:50:35'),
(14, 5, 4, 44, 0, '2026-05-18 16:50:35'),
(15, 1, 1, 2, 1, '2026-05-18 17:26:42'),
(16, 1, 1, 28, 1, '2026-05-18 17:26:42'),
(17, 3, 2, 2, 0, '2026-05-18 17:27:06'),
(18, 3, 2, 28, 0, '2026-05-18 17:27:06'),
(19, 3, 2, 3, 0, '2026-05-18 17:28:16'),
(20, 3, 2, 27, 0, '2026-05-18 17:28:16'),
(21, 4, 3, 2, 0, '2026-05-18 17:39:12'),
(22, 4, 3, 43, 0, '2026-05-18 17:39:12'),
(23, 6, 2, 2, 0, '2026-05-18 17:44:46'),
(24, 6, 2, 2, 0, '2026-05-18 17:44:46');

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id`, `name`, `status`, `created_at`) VALUES
(1, 'Volcano Express', 'active', '2026-05-16 06:52:01'),
(2, 'Kigali Coach', 'active', '2026-05-16 06:52:02'),
(3, 'kivu tress', 'active', '2026-05-17 03:32:42'),
(4, 'jaguar', 'active', '2026-05-17 03:40:41'),
(5, 'Ritco', 'active', '2026-05-17 16:50:07'),
(6, 'internatonal', 'active', '2026-05-17 16:51:01'),
(7, 'interational', 'active', '2026-05-18 14:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `company_cars`
--

CREATE TABLE `company_cars` (
  `id` int(11) NOT NULL,
  `car_plate` varchar(50) NOT NULL,
  `car_name` varchar(100) NOT NULL,
  `total_sits` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_cars`
--

INSERT INTO `company_cars` (`id`, `car_plate`, `car_name`, `total_sits`, `user_id`, `created_at`) VALUES
(1, 'RAB123AA', 'Toyota Coaster', 30, 1, '2026-05-16 06:52:03'),
(2, 'RAC456B', 'Yutong Bus', 45, 1, '2026-05-16 06:52:03'),
(3, 'RAB123D', 'benz bus', 45, 1, '2026-05-17 03:19:48'),
(4, 'RAB123F', 'benz taxes', 4, 5, '2026-05-17 03:57:50');

-- --------------------------------------------------------

--
-- Table structure for table `company_driver`
--

CREATE TABLE `company_driver` (
  `id` int(11) NOT NULL,
  `driver_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password_code` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_driver`
--

INSERT INTO `company_driver` (`id`, `driver_name`, `phone_number`, `password_code`, `user_id`, `created_at`) VALUES
(1, 'Jean Claude', '0788111111', 'DRIVER123', 1, '2026-05-16 06:52:03'),
(2, 'Eric Manzi', '0788222222', 'DRIVER456', 1, '2026-05-16 06:52:03'),
(3, 'Olivie Odile', '0788765305', '1111', 1, '2026-05-17 12:32:23');

-- --------------------------------------------------------

--
-- Table structure for table `company_station`
--

CREATE TABLE `company_station` (
  `id` int(11) NOT NULL,
  `station_name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `password_code` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_station`
--

INSERT INTO `company_station` (`id`, `station_name`, `address`, `password_code`, `user_id`, `created_at`) VALUES
(1, 'Nyabugogo Station', 'Kigali - Nyabugogo', 'STATION123', 1, '2026-05-16 06:52:04'),
(2, 'Huye Station', 'Huye Town', 'STATION456', 1, '2026-05-16 06:52:04'),
(3, 'nyabugogo', 'kigali', '9111', 4, '2026-05-17 15:28:31'),
(4, 'kigali', 'huye', '2239', 1, '2026-05-18 07:38:00'),
(5, 'rutsiro', 'kigali', '8279', 1, '2026-05-18 10:22:27'),
(6, 'j\\huye', 'kigali', '4471', 5, '2026-05-18 15:00:04');

-- --------------------------------------------------------

--
-- Stand-in structure for view `daily_company_report`
-- (See below for the actual view)
--
CREATE TABLE `daily_company_report` (
`company_id` int(11)
,`company_name` varchar(150)
,`total_cars` bigint(21)
,`total_drivers` bigint(21)
,`total_stations` bigint(21)
,`total_launch_cars` bigint(21)
,`total_tickets` bigint(21)
,`active_tickets` decimal(22,0)
,`inactive_tickets` decimal(22,0)
,`total_income` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `driver_locations`
--

CREATE TABLE `driver_locations` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `status` enum('active','offline','break') DEFAULT 'offline',
  `current_route` varchar(255) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `launch_cars`
--

CREATE TABLE `launch_cars` (
  `id` int(11) NOT NULL,
  `car_plate` varchar(50) NOT NULL,
  `location_id` int(11) NOT NULL,
  `travel_time` datetime NOT NULL,
  `available_sits` int(11) DEFAULT 0,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `launch_cars`
--

INSERT INTO `launch_cars` (`id`, `car_plate`, `location_id`, `travel_time`, `available_sits`, `status`, `created_at`) VALUES
(1, 'RAB123AA', 1, '2026-05-18 04:42:00', 27, 'active', '2026-05-16 06:52:08'),
(2, 'RAC456B', 1, '2026-05-18 10:12:00', 43, '', '2026-05-16 06:52:08'),
(3, 'RAB123AA', 2, '2026-05-17 04:26:00', 26, 'active', '2026-05-17 11:26:25'),
(4, 'RAB123D', 3, '2026-05-18 11:09:00', 42, 'active', '2026-05-18 14:09:49'),
(5, 'RAC456B', 4, '2026-05-18 10:10:00', 43, 'active', '2026-05-18 14:10:37'),
(6, 'RAB123F', 2, '2026-05-18 08:06:00', 1, 'active', '2026-05-18 15:00:41');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `travel_from` varchar(100) NOT NULL,
  `travel_to` varchar(100) NOT NULL,
  `price_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `travel_from`, `travel_to`, `price_amount`, `created_at`) VALUES
(1, 'Kigali', 'Huye', 3500.00, '2026-05-16 06:52:06'),
(2, 'Kigali', 'Musanze', 5000.00, '2026-05-16 06:52:06'),
(3, 'Kigali', 'Rubavu', 7000.00, '2026-05-16 06:52:07'),
(4, 'rutsiro', 'karongi', 1000.00, '2026-05-18 14:10:15'),
(5, 'musanze', 'kigali', 45556.00, '2026-05-18 14:21:52');

-- --------------------------------------------------------

--
-- Table structure for table `passenger_ticket`
--

CREATE TABLE `passenger_ticket` (
  `id` int(11) NOT NULL,
  `passenger_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `launch_car_id` int(11) NOT NULL,
  `ticket_life_cycle` enum('active','inactive') DEFAULT 'active',
  `price` decimal(10,2) NOT NULL,
  `location_id` int(11) NOT NULL,
  `car_plate` varchar(50) NOT NULL,
  `travel_time` datetime NOT NULL,
  `payment_method` enum('mtn','airtel','cash') DEFAULT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `qr_code` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `actual_dropoff_time` datetime DEFAULT NULL,
  `dropoff_location_id` int(11) DEFAULT NULL,
  `seat_number` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `passenger_ticket`
--

INSERT INTO `passenger_ticket` (`id`, `passenger_name`, `phone_number`, `launch_car_id`, `ticket_life_cycle`, `price`, `location_id`, `car_plate`, `travel_time`, `payment_method`, `payment_status`, `qr_code`, `created_at`, `actual_dropoff_time`, `dropoff_location_id`, `seat_number`) VALUES
(1, 'Alice Uwimana', '0788333333', 1, 'inactive', 3500.00, 1, 'RAB123AA', '2026-05-16 08:00:00', NULL, 'pending', 'QR-OFFLINE-STATION-001', '2026-05-16 06:52:08', NULL, NULL, NULL),
(3, 'blazibeat', '0739103590', 3, 'active', 5000.00, 2, 'RAB123AA', '2026-05-17 11:26:00', '', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAADUCAYAAADk3g0YAAAAAklEQVR4AewaftIAAApbSURBVO3BQY7gSJDgQFLI/3+ZW0ffSwCCIqtrZtzM/mCtdcXDWuuah7XWNQ9rrWse1lrXPKy1rnlYa13zsNa65mGtdc3DWuuah7XWNQ9rrWse1lrXPKy1rnlYa13zsNa65oePVP6mihOVqWJSeaPiRGWqmFSmii9UpopJZaqYVE4qJpU3Kt5QmSomlb+p4ouHtdY1D2utax7WWtf8cFnFTSpvVPwmlaniDZWp4guVE5Wp4o2KN1Smikllqnij4iaVmx7WWtc8rLWueVhrXfPDL1N5o+INlaliUpkqTlQmlROVqeINlZOKqWJSeUNlqjhRmSomlf+SyhsVv+lhrXXNw1rrmoe11jU/rP9PxRcqv0nlpGJSOVE5qZhUblKZKv4ne1hrXfOw1rrmYa11zQ//y1W8oTJVnKj8JpU3VE4q3lA5qThR+b/kYa11zcNa65qHtdY1P/yyin+ZylRxonJSMam8UfGGylRxojJVTCpTxYnKScVvqviXPKy1rnlYa13zsNa65ofLVP4lKlPFGypTxaTyRsWkcqIyVbyhMlVMKlPFpDJVnFRMKlPFpDJVnKj8yx7WWtc8rLWueVhrXfPDRxX/EpWp4qRiUvlC5aaKm1Smit9UcVJxUvE/ycNa65qHtdY1D2uta374SGWqmFRuqpgqTlR+U8WJyqRyovKbKiaVqeImlZOKE5WbKn7Tw1rrmoe11jUPa61rfrhM5YuKE5WpYlJ5o+JE5Q2Vk4oTlaniRGVSOVH5TSonFZPKVDFVnKhMFW+oTBVfPKy1rnlYa13zsNa65odfVjGpnKi8oTJVfKFyovJfUpkqJpWp4g2VE5U3Kk4qJpWp4jdV3PSw1rrmYa11zcNa65ofLquYVL6oOFE5UTmpeKPiDZVJ5YuKL1SmiqliUpkqJpU3VKaKqeJEZaqYVKaKE5Wp4ouHtdY1D2utax7WWtf8cJnKScWkcqLyhsoXFZPKpPJGxYnKVHGiMlXcpDJVTConFZPKGypTxRsVk8pU8Zse1lrXPKy1rnlYa13zw2UVk8pJxRcqU8Wk8obKScWJyqTyhspUMVW8ofJGxaRyUvFGxaQyVfwmlanipoe11jUPa61rHtZa1/zwH1OZKiaVLyomlUllqnhD5Y2KL1SmiqniROVEZao4UTmpOKmYVKaKLyomlUllqvjiYa11zcNa65qHtdY1P3xUMamcqEwVk8pUMalMFScqU8WJylTxm1ROKqaKE5UvKt6omFROVKaKL1SmiknlpOKmh7XWNQ9rrWse1lrX2B/8RSpTxYnKFxWTylQxqbxRcaJyUvGGyhsVk8pUcaLyRsWkMlWcqJxUnKhMFScqU8UXD2utax7WWtc8rLWusT/4QOWNiptUpopJ5YuKSeWkYlI5qfhC5Y2KN1TeqJhU3qiYVE4qTlSmit/0sNa65mGtdc3DWuuaH/4ylaliUjmpOFGZKiaVN1ROKiaVqeINlaniJpWTiqniDZWp4kTlpOJEZap4Q2Wq+OJhrXXNw1rrmoe11jU/fFTxhsqkMlXcpHJScaIyVUwqJypvVEwqb1S8oTKpTBWTylTxhspU8YbKVPFFxU0Pa61rHtZa1zysta6xP/hFKn9TxRcqN1WcqPymikllqjhRmSpOVKaKE5WbKiaVqWJSmSq+eFhrXfOw1rrmYa11zQ8fqdxU8YbKicpUcVJxojJV3FTxhspU8YXKicpJxRcVb6h8UXHTw1rrmoe11jUPa61rfrisYlL5QmWqOFE5UZkq3qiYVE4qvlCZKk5Upoo3Kk5UTlROKt5QmSq+UDmp+OJhrXXNw1rrmoe11jU/fFTxmyq+qPhC5Y2KE5U3Kr5QOVGZKk4q3lD5ouKLir/pYa11zcNa65qHtdY19gd/kcpvqphUpopJ5YuKSWWqOFG5qeINlZOKN1SmiknlN1VMKicVNz2sta55WGtd87DWuuaHj1SmiknljYoTlaniDZWTiknljYpJZap4o+INlZtU3qiYVKaKSWWqmFSmii8qftPDWuuah7XWNQ9rrWvsDy5SmSomlaliUvmbKiaVqWJSOak4UZkqJpWTir9J5Y2KSWWq+EJlqviXPKy1rnlYa13zsNa6xv7gH6IyVUwqJxWTym+qmFSmijdUpopJZao4UZkqJpWTikllqvhC5Y2KE5WpYlKZKm56WGtd87DWuuZhrXWN/cEvUnmjYlJ5o+JEZao4UfmbKiaVqeImlaliUpkqTlTeqDhROan4lzysta55WGtd87DWuuaHv6xiUplUpopJ5SaVLyomlZOKE5Wp4g2VNyomlROVk4o3VE4qTlSmiv/Sw1rrmoe11jUPa61r7A8uUpkqJpWpYlI5qThRmSpOVL6oOFGZKiaVqeJE5aRiUpkqJpWp4kTlpGJSmSpOVN6omFROKiaVqeKLh7XWNQ9rrWse1lrX/PCRyhsVJxUnKicVk8pUcVIxqUwVN1WcqEwVk8pJxaRyonJTxYnKVDGpnKicVEwqv+lhrXXNw1rrmoe11jU/XFYxqUwVb6hMFZPKpHKiMlX8l1TeULmp4iaVNyomlTcq/iUPa61rHtZa1zysta6xP/gPqUwVJypTxYnKScWJyknFpDJV/CaVqeINlZOKE5Wp4g2VqeImlaliUpkqvnhYa13zsNa65mGtdc0P/ziVqWJSeaPiROWk4iaVqWJSmSqmijdUTiomlS9UpoqpYlJ5o+KLipse1lrXPKy1rnlYa13zw2UqN1W8UfGGyknFpPKGyknFpPKGyhsVJyonFW9UTCpfVEwqJxV/08Na65qHtdY1D2uta+wPPlCZKk5UTiomlaliUjmp+E0qU8Wk8jdVTConFZPKVDGpfFExqdxUcaIyVdz0sNa65mGtdc3DWusa+4P/wVSmii9U3qiYVKaKE5Wp4g2VNyomlaniN6mcVLyhclLxNz2sta55WGtd87DWuuaHj1T+poqp4kTlv6QyVbyhMlWcVJyoTBUnKlPFpDJVTCpfqEwVJxUnKicVXzysta55WGtd87DWusb+4AOVqeImlaliUvmiYlKZKiaV31TxhspNFV+oTBUnKlPFGypvVEwqU8UXD2utax7WWtc8rLWu+eGXqbxRcVPFpPKGyknFpPKFyhcVk8pUMalMKlPFpHJS8YXKTRUnFTc9rLWueVhrXfOw1rrmh//jVKaKN1SmikllqnhDZao4UTlReUNlqjhROan4omJSmSr+Sw9rrWse1lrXPKy1rvnhf5mKNypuUjlRmSomlaniRGWqOFGZKr5QmSq+qDhRmSpOVKaK3/Sw1rrmYa11zcNa65offlnFb6o4UZkq3lA5qZhUvqi4SeUNlZOKqWJSOak4UTmpmFSmiv/Sw1rrmoe11jUPa61r7A8+UPmbKiaVk4pJ5aRiUpkqJpWpYlL5omJSeaNiUnmjYlJ5o2JSualiUnmj4qaHtdY1D2utax7WWtfYH6y1rnhYa13zsNa65mGtdc3DWuuah7XWNQ9rrWse1lrXPKy1rnlYa13zsNa65mGtdc3DWuuah7XWNQ9rrWse1lrX/D+A3HfyVhAiGQAAAABJRU5ErkJggg==', '2026-05-18 09:57:42', NULL, NULL, NULL),
(6, 'ursule ', '0788600449', 2, 'active', 3500.00, 1, 'RAC456B', '2026-05-18 11:38:00', '', 'paid', 'data:image/png;base64,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', '2026-05-18 10:09:27', NULL, NULL, NULL),
(7, 'furah', '07888683890', 1, 'active', 3500.00, 1, 'RAB123AA', '2026-05-18 11:42:00', 'cash', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAADUCAYAAADk3g0YAAAAAklEQVR4AewaftIAAApSSURBVO3BQY7gRpIAQXei/v9lXx3jlADBrG5pNszsH6y1rnhYa13zsNa65mGtdc3DWuuah7XWNQ9rrWse1lrXPKy1rnlYa13zsNa65mGtdc3DWuuah7XWNQ9rrWse1lrX/PCRyp9UMalMFScqJxUnKlPFpDJVfKFyUjGpfFExqbxR8YbKVDGp/EkVXzysta55WGtd87DWuuaHyypuUrmp4g2VE5WbVKaKNypOVKaKSeWkYlKZVKaKSWWqeKPiJpWbHtZa1zysta55WGtd88MvU3mj4o2KE5WTipOKSWWqeENlqpgqJpWp4g2VqWJSmSq+qPiTVN6o+E0Pa61rHtZa1zysta754T9O5Y2KSWWqOKl4Q2WqOFGZKiaVk4oTlaniROUNlaniRGWq+C97WGtd87DWuuZhrXXND/9xFScqJxVvqLxRMam8ofKGylQxqZyoTBUnKlPFpPL/ycNa65qHtdY1D2uta374ZRX/ZionFW9UnFRMKlPFGypvVLyhMlWcqEwVv6ni3+RhrXXNw1rrmoe11jU/XKbyJ6lMFV9UTCpTxaRyojJVvKEyVZxUTCpTxaQyVUwqb1RMKlPFpDJVnKj8mz2sta55WGtd87DWuuaHjyr+zSreULmp4ouKLypOKiaVNyomlanii4r/koe11jUPa61rHtZa1/zwkcpUMamcVEwqb1TcVDGpTCpfqJyofKHyRsVJxaQyVXxRcaIyVZyoTBWTyknFFw9rrWse1lrXPKy1rvnhl1VMKicVJypvqJxUvFFxovJGxaQyVZyofKEyVUwqJyonKlPFpDJVTBUnKlPFpDJVTCo3Pay1rnlYa13zsNa65ofLVKaKE5WpYlKZKiaVqWKqOFF5Q2WqOKk4UZkq/qSKSWWq+JNUbqr4kx7WWtc8rLWueVhrXfPDZRUnFZPKpDJVTCpTxYnKGxVfVEwqU8WJyknFScWJyqQyVfwmlTcqblL5TQ9rrWse1lrXPKy1rvnhl6lMFVPFpDKpnKhMFVPFpHKiclIxqZxUvFFxojJVTCpTxUnFicpU8SepnFRMKicVk8pND2utax7WWtc8rLWusX/wF6lMFScqv6liUpkqvlCZKn6TyknFpDJVTCpTxaTyRsWkMlWcqEwVb6hMFV88rLWueVhrXfOw1rrmh8tUpopJ5Q2Vv6liUjmpmFSmiknli4pJZao4UZkqvqg4UZlUvqiYVN6ouOlhrXXNw1rrmoe11jX2Dz5QuaniC5WTihOVqeINlZOKE5Wp4kRlqjhROam4SeWk4guVqeJvelhrXfOw1rrmYa11zQ+XVXyhclIxqUwVk8qJyonKScVUMamcqLyh8obKVHGiMlVMKlPFFyonFScVk8pUcaIyVXzxsNa65mGtdc3DWusa+we/SOWNij9J5YuKE5Wp4kTlpOJEZar4TSpTxYnKVHGiMlV8oXJS8cXDWuuah7XWNQ9rrWt+uExlqvhCZap4Q2WqmComlaliUplUpoqbKiaVqeINlaliUjmpmComlZOKSWWqmCpOVKaKNypuelhrXfOw1rrmYa11zQ9/mcpJxaRyk8pNKlPFFypvVEwqU8UbFScqU8Wk8oXKGypTxVQxqUwVXzysta55WGtd87DWuuaHj1R+k8obFZPKpDJVTCpvVEwqk8pvUpkqpopJ5QuVE5UvVG5SmSp+08Na65qHtdY1D2uta374qGJS+aLiDZU3KiaVqWJSeaPiDZWp4g2VNyp+U8Wk8kbFGypTxaRyUnHTw1rrmoe11jUPa61rfvhIZaq4SWWqOFE5UZkqJpWp4guVqeINlaniROWkYlI5qfibVKaKE5WpYlI5qfjiYa11zcNa65qHtdY1P/wylS8q3qiYVKaKN1ROKn5TxRsVk8pJxaTyhcpUMam8UfFGxaRyUnHTw1rrmoe11jUPa61rfvioYlKZKiaVE5V/k4oTlZOKN1RuqjhRmSreqJhUTiomlUnlv+xhrXXNw1rrmoe11jU//GEVN6lMKicqJxWTyknFpHKiMlW8oXKiMlX8TSonFScqU8UXFZPKVPHFw1rrmoe11jUPa61r7B98oHJSMancVPE3qUwVX6icVEwqJxWTyp9UMalMFX+SylRx08Na65qHtdY1D2uta364rOKLijdU3qiYVE4qJpUvVKaKqeJEZao4UTmpmFSmijdUTireUJkqJpWTij/pYa11zcNa65qHtdY1P3xU8ZtUpoqp4jepnFT8TSpTxRsqJypTxRsqU8UbFScVJypTxaQyVXzxsNa65mGtdc3DWuuaHz5SmSpOKiaVSWWqOFGZKk5UpooTlaliUjmp+EJlqphU3qg4UXlDZaqYVG5SmSomlROVqeKmh7XWNQ9rrWse1lrX/PBRxU0Vk8pJxYnKicpJxRcqU8WkMlWcqLxRcaIyVUwqk8pU8YbKb6qYVP6kh7XWNQ9rrWse1lrX/PDLVL6oOFGZKk4qJpU3VKaKm1SmikllqphUTiqmit9UMamcVLyhMlWcVEwqU8UXD2utax7WWtc8rLWu+eEylZOKSWVS+ULlJpUTlS8qJpUvKiaVE5Wp4iaVk4qbVP6mh7XWNQ9rrWse1lrX2D/4RSonFTepTBWTym+qmFSmijdUpopJZaqYVE4qJpWp4kTlpOJEZaqYVE4qJpUvKr54WGtd87DWuuZhrXXND7+s4kRlqphUpopJ5Y2KSWWqOFG5SeWLiknlpOILlaliUvlC5aaKE5WbHtZa1zysta55WGtd88NlKjdV/JtVTCpTxaQyVdxUMan8JpWpYlI5qThRmSomlanib3pYa13zsNa65mGtdc0PH6lMFScqb6h8ofKGyknFScWkMlVMKjdVvKFyonJS8UbFpPKGyhsqU8VUcdPDWuuah7XWNQ9rrWvsH/yHqZxUnKicVJyovFExqUwVb6icVHyhMlVMKlPFGypTxRsqU8Wk8kbFFw9rrWse1lrXPKy1rvnhI5U/qeKkYlK5SWWqOFH5QmWq+JMq3lCZKiaVN1SmipsqbnpYa13zsNa65mGtdc0Pl1XcpPKGyknFFxVvVHxR8YXKFxUnFZPKScWkclLxhspJxW96WGtd87DWuuZhrXXND79M5Y2KNyomlaniC5WTiknlpOJE5YuKE5WTihOVL1ROVL6omFROVKaKLx7WWtc8rLWueVhrXfPDf5zKVHFTxaRyUnGiMlVMKlPFpPKGylRxonJSMalMFV9UnKi8UTGpTBU3Pay1rnlYa13zsNa65of/MSpTxaRyk8qfVPFGxaQyVZxU/E0qb6icVPymh7XWNQ9rrWse1lrX/PDLKn5TxaQyqZxU3KRyUvGGyknFpPInVUwqX6i8UTGpvKEyVXzxsNa65mGtdc3DWuuaHy5T+ZNU3qiYVG6qeENlqphUTlROKk5UbqqYVE4qTlSmiknlpOKk4qaHtdY1D2utax7WWtfYP1hrXfGw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWueVhrXfOw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWu+T8Pg1wjB8ZwQAAAAABJRU5ErkJggg==', '2026-05-18 12:17:49', NULL, NULL, NULL),
(12, 'manzi bruce', '0788888999', 6, 'active', 5000.00, 2, 'RAB123F', '2026-05-18 15:06:00', '', 'paid', 'data:image/png;base64,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', '2026-05-18 15:31:46', NULL, NULL, NULL),
(17, 'ade', '0788000041', 4, 'active', 7000.00, 3, 'RAB123D', '2026-05-18 18:09:00', '', 'pending', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAT4SURBVO3BS4okSxIAQVUn739lnV4NtgoI0qs/DxOxX1jrksNaFx3Wuuiw1kWHtS46rHXRYa2LDmtddFjrosNaFx3Wuuiw1kWHtS46rHXRYa2LDmtd9OFLKr9TxRsqU8VNKm9UTCpTxaTyO1V847DWRYe1LjqsddGHyypuUnmiMlW8ofKkYlKZKiaVJypTxRsVN6ncdFjrosNaFx3WuujDD1N5o+KNiknlJ1VMKlPFpPJEZap4Q+WNip90WOuiw1oXHda66MN/TMUbFZPKE5WpYlKZKp6o/Jcc1rrosNZFh7Uu+vCPU3mjYlKZKiaVqWJS+UbFf8lhrYsOa110WOuiDz+s4idVvKEyVUwqU8WkMlVMKpPKk4pvVPxNDmtddFjrosNaF324TOV3UpkqJpWpYlKZKiaVqWJSmSomlaliUpkqnqj8zQ5rXXRY66LDWhfZL6z/U5kqJpWp4g2VqeK/5LDWRYe1LjqsddGHL6lMFZPKVDGpTBWTylTxhsobFZPKVDGpTBVPKiaVqeINlaniicpUcdNhrYsOa110WOuiD39YxZOKP6liUnmi8g2VqeJJxaTyhspU8Y3DWhcd1rrosNZFH75UMalMFU9UpopJZap4o+INlaliqviGypOKSWWqeKNiUvlJh7UuOqx10WGti+wXfpDKVDGpTBU/SWWqeEPlScUTlaniDZWp4hsqU8U3DmtddFjrosNaF334ksqTiknlDZWpYlKZKiaVJypTxZOKSeWJylQxqXxDZar4kw5rXXRY66LDWhd9+MMqnlRMKlPFpPJGxaQyVUwqU8WkMlU8qZhUpoqbVH7SYa2LDmtddFjrog9fqniiMlU8UXlSMalMFU9UJpWpYlKZKiaVqeINlaliUpkqJpW/yWGtiw5rXXRY66IPX1J5Q2WqmCpuUnlSMak8UXmi8g2Vb1T8SYe1LjqsddFhrYs+fKniDZUnKj+pYlKZKiaVJxVPVJ5UPFGZVKaKSWWq+J0Oa110WOuiw1oXffjLVbyhMlU8qXij4onKVPFEZap4UvGk4onKk4pvHNa66LDWRYe1LvrwJZWpYlL5hsqTiqniicobFZPKVPFEZar4hsqTiknldzqsddFhrYsOa11kv3CRylTxROVJxaTykyreULmp4hsqU8WkMlXcdFjrosNaFx3WuujDl1SmiknljYpJZap4ovJGxRsqTyreUJlUfieVqeIbh7UuOqx10WGti+wX/mEqTyqeqDypmFSeVEwqb1S8ofJGxU86rHXRYa2LDmtd9OFLKr9TxVTxhspU8URlqphUJpUnFZPKE5Wp4knFE5UnFd84rHXRYa2LDmtd9OGyiptUvqEyVTxReaIyVUwqU8U3Km6qmFRuOqx10WGtiw5rXfThh6m8UfGGylTxROVJxaQyVUwqT1Smiicq/7LDWhcd1rrosNZFH/5xFZPKVPGGyhOVqWJSualiUnmiMlU8qbjpsNZFh7UuOqx10Yd/nMobKlPFk4o3Kv4mKlPFpDJVfOOw1kWHtS46rHXRhx9W8ZMqnqg8UZkqnqi8UfGTKt5QmSpuOqx10WGtiw5rXfThMpXfSWWqmComlW9UTCo3VbyhMlW8oTJVfOOw1kWHtS46rHWR/cJalxzWuuiw1kWHtS46rHXRYa2LDmtddFjrosNaFx3Wuuiw1kWHtS46rHXRYa2LDmtddFjrov8BV+pKWNPqKuEAAAAASUVORK5CYII=', '2026-05-18 16:48:29', NULL, NULL, NULL),
(18, 'mapaix', '0788000001', 5, 'active', 1000.00, 4, 'RAC456B', '2026-05-18 17:10:00', '', 'pending', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATQSURBVO3BQY4cSRIEQdNA/f/Lujz6KYBEehebOyaCf6RqyUnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXok5eAfJOaCcikZgLym6iZgExqJiDfpOaNk6pFJ1WLTqoWfbJMzSYgTwCZ1ExAnlDzBpAJyBtqNgHZdFK16KRq0UnVok9+GJAn1GwCMqm5ATIBuVEzAfkmIE+o+UknVYtOqhadVC365B+n5gbIDZBJzQ2QGzU3QCY1/09OqhadVC06qVr0yT8OyKRmUjMBeQLIpOYGyH/ZSdWik6pFJ1WLPvlhan6SmifUPKFmAjKpeULNJjW/yUnVopOqRSdViz5ZBuSbgExqJiCTmgnIpGYCMqmZgExqJiA3QCY1N0B+s5OqRSdVi06qFn3ykpq/Sc0E5A0gN0C+Sc2/5KRq0UnVopOqRZ+8BGRScwPkX6LmBsiNmgnIpGYCMqm5ATKpmYA8oeaNk6pFJ1WLTqoWffJlam6ATGomIJOaGyATkBs1E5AbNROQSc2k5g0gT6j5ppOqRSdVi06qFuEf+UFAJjUTkCfUTEBu1ExAbtRMQJ5QMwGZ1ExAnlAzAblR800nVYtOqhadVC365CUgk5pNam7U3ACZ1Dyh5gbIBOQGyI2aCcgEZFIzAbkBMqnZdFK16KRq0UnVok9+GTUTkEnNDZBJzQ2Qv0nN3wRkUvPGSdWik6pFJ1WL8I8sAvKGmhsgN2reADKpuQHyhJoJyCY1E5BJzQRkUvPGSdWik6pFJ1WLPnkJyKTmCSA3QCY1v4maJ4DcqLkB8oSabzqpWnRSteikatEny4A8oWYCMqmZgExqJiBPqHkDyKRmAjKpeQLIpGYCMgH5m06qFp1ULTqpWvTJD1PzhJoJyA2QSc0EZFIzAZnUTEAmNTdANqmZgExqJiCTmgnITzqpWnRSteikatEnXwZkUnOjZgLyBpAn1NyoeQLIpGYCcqNmAvKEmp90UrXopGrRSdWiT34ZIE+omYDcqLkBsknNDZAngDwBZFIzAZnUvHFSteikatFJ1aJPfhiQGyA3aiYgN2omIJvUTEBugNyouQEyqZmAvKFm00nVopOqRSdViz75YWqeADIB2QTkCTUTkEnNE0AmIE8AuVEzAbkBMql546Rq0UnVopOqRfhH/mFAbtRMQCY1E5A31NwAuVHzBJBJzQ2QGzVvnFQtOqladFK16JOXgHyTmhs1E5BJzQTkRs0EZFIzAZnUvAFkUvOGmp90UrXopGrRSdWiT5ap2QTkCSDfBGRSMwGZ1ExAbtQ8AWRS800nVYtOqhadVC365IcBeULNJjWb1NwAuQFyA+SbgExq3jipWnRSteikatEn/zFAngAyqZmATGomIJOaGyCTmgnIpOYJIJOaTSdVi06qFp1ULfrkH6dmAjIBeUPNBGRSc6NmAjKpuQFyA2RS8wSQSc0bJ1WLTqoWnVQt+uSHqflN1ExAJjVPAJnU3KiZgExqJiBPALlRMwHZdFK16KRq0UnVok+WAfkmID8JyI2aCcgmNROQGzVPqNl0UrXopGrRSdUi/CNVS06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pF/wN9mBODw0XyNgAAAABJRU5ErkJggg==', '2026-05-18 16:50:35', NULL, NULL, NULL),
(25, 'fanny', '0781236389', 1, 'active', 3500.00, 1, 'RAB123AA', '2026-05-18 11:42:00', '', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAS3SURBVO3BQY4kRxIEQdNA/f/LunP0vQSQSK9mD2ki+EeqlpxULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLPnkJyE9SMwG5UTMBeUPNE0AmNROQSc0E5CepeeOkatFJ1aKTqkWfLFOzCciNmgnIjZoJyI2aTUDeULMJyKaTqkUnVYtOqhZ98mVAnlDzTUBu1ExAbtTcqLkB8gaQJ9R800nVopOqRSdViz75ywGZ1ExAJjVvqLkB8l92UrXopGrRSdWiT/5lgDwB5Akgk5pJzQRkUvNvdlK16KRq0UnVok++TM1PUjMBmYBsAjKpuQEyqXlDzW9yUrXopGrRSdWiT5YB+c3UTEAmNROQSc0E5Ak1E5BJzQ2Q3+ykatFJ1aKTqkX4R/5iQCY1E5AbNZuATGr+S06qFp1ULTqpWvTJS0AmNU8AmdRMQH4SkBs1E5BJzQ2Qn6TmBsik5o2TqkUnVYtOqhZ9sgzIpGYCMqmZgExqngByo+YNIJOaCcik5kbNBORvdlK16KRq0UnVIvwjXwTkn6TmNwMyqXkDyI2aCcik5o2TqkUnVYtOqhbhH/kiIJOaGyCTmgnIpGYC8oaaGyCTmgnIpOYJIJvU/KSTqkUnVYtOqhZ9sgzIpOYNIJOaTWomIDdqbtRMQN5QMwGZ1ExA/kknVYtOqhadVC365CUgk5oJyKTmRs0NkCfUvKHmBsgbaiYgTwCZ1ExAJjUTkEnNGydVi06qFp1ULcI/8gKQGzUTkBs1E5BJzQTkDTVPAHlDzQTkm9TcAJnUvHFSteikatFJ1aJPlql5A8ik5kbNBOQJIE+ouQEyqZmATGomIJOaGyC/yUnVopOqRSdViz5ZBmRSM6m5ATIBmdTcqJmATGomIG8AmdRMQL5JzW9yUrXopGrRSdWiT34YkEnNjZoJyI2aGyCTmgnIE2omIJOaGyCTmhsgN2omIJOabzqpWnRSteikatEnL6m5ATKpeQLIjZoJyKRmAnKj5gbIE0AmNZOaCcgmNT/ppGrRSdWik6pFn3yZmhsgk5obIL+JmieATGomNROQSc0E5Akg33RSteikatFJ1aJPXgJyo2YC8gSQSc0EZFLzBpAbNROQSc0TQJ4AsknNppOqRSdVi06qFuEf+YsB2aRmAnKj5g0gk5ongNyomYBMajadVC06qVp0UrXok5eA/CQ1b6i5AfIEkG8CMqm5UTMBmdRMQCY1b5xULTqpWnRSteiTZWo2AblRcwNkAvKEmhsgk5ongNyoeQLIpGYCMqnZdFK16KRq0UnVok++DMgTap4AMqmZ1NwAeQLIE0CeAPI3O6ladFK16KRq0Sd/OTUTkEnNBGRScwNkUjMBeULNBORGzRtAftJJ1aKTqkUnVYs+qf8DZFIzAZnUTECeUDMBmYBMajYBmdS8cVK16KRq0UnVok++TM1PUvMEkCfUTECeAPJNQCY1E5BvOqladFK16KRq0SfLgPwkIJOaJ9S8oeYGyBNqJiA3QN5Qs+mkatFJ1aKTqkX4R6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYv+B9v4D2MbYX43AAAAAElFTkSuQmCC', '2026-05-18 17:26:42', NULL, NULL, NULL),
(26, 'fannyy', '0739103597', 3, 'active', 5000.00, 2, 'RAB123AA', '2026-05-17 11:26:00', '', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAUGSURBVO3BQY4kRxLAQDJQ//8yd45+SiBR0a2R1s3sD9a65LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOuiw1oXffiSym+q+EkqU8Wk8kbFpDJVPFH5TRXfOKx10WGtiw5rXfThsoqbVH6SylQxqUwVT1QmlaliUpkqnlTcpHLTYa2LDmtddFjrog8/TOWNim+oTBWTylTxpGJSmSq+UfENlTcqftJhrYsOa110WOuiD/9xKlPFE5Wp4o2KJypTxX/JYa2LDmtddFjrog//MRWTyhOVJypTxRsq/08Oa110WOuiw1oXffhhFT9JZap4ojJVTCpTxaTypGKqmFRuqvibHNa66LDWRYe1LvpwmcrfrGJSmSomlaliUnmiMlVMKlPFE5W/2WGtiw5rXXRY66IPX6r4J1VMKlPFpDJV/KSKJxVPKv5NDmtddFjrosNaF334kspU8URlqphUnlRMKm9UTCpTxTdUpoo3VKaKSWWq+Jsc1rrosNZFh7Uu+nCZypOKSWWqeKPiDZUnKlPFpPINlScVk8pU8UTlGxXfOKx10WGtiw5rXWR/8AWVb1Q8UZkqnqhMFW+oPKl4Q+VJxROVNyqeqEwVNx3Wuuiw1kWHtS6yP/hBKt+omFSmiknlJ1VMKlPFGypTxRsqU8WkMlVMKlPFNw5rXXRY66LDWhd9+MtUTCpPVJ5UTCpPKiaVJxXfqJhU3qh4UvGbDmtddFjrosNaF9kffEFlqnhDZaq4SWWq+IbKk4pJ5UnFTSpTxaQyVdx0WOuiw1oXHda66MOXKiaVJxVvqEwVk8pUMVU8UZkqnlRMKm9UPFGZKiaVqeIbKlPFNw5rXXRY66LDWhd9+JLKk4pJZap4UvENlTdUpopJ5YnKVHFTxaQyVTyp+EmHtS46rHXRYa2LPlxW8aRiUvlJFZPKVDGpTCpTxaQyVUwqTyq+UfENlaniG4e1LjqsddFhrYs+fKnipoonKlPFE5VvVDypmFSmiicqU8UTlaniicpvOqx10WGtiw5rXfThSypTxaQyVUwVk8pvUpkqJpWpYlKZKt6oeKIyVfzNDmtddFjrosNaF334UsUbKm9UTCpPVN6omFS+oTJVvKEyVTxRmSqmiknlJx3Wuuiw1kWHtS6yP/iCylTxhspUMalMFW+oPKl4Q+UbFZPK36TiG4e1LjqsddFhrYs+fKniGxVPKp6oPKl4Q2WqeKNiUnmj4g2VNyp+0mGtiw5rXXRY66IPX1L5TRVTxaQyqTypeKIyVUwqTyq+oTJVvFExqUwVNx3Wuuiw1kWHtS76cFnFTSpPVKaKN1S+UTGpTBWTyhsVb1RMKlPFpDJVfOOw1kWHtS46rHXRhx+m8kbFGxWTyjcqJpUnKlPFk4pJZVK5qWJS+UmHtS46rHXRYa2LPvzLqUwVk8pUMalMKlPFpPJE5UnFk4pJ5Q2VqWKqmFRuOqx10WGtiw5rXfThX67iDZUnFZPKVPFEZap4UvFGxaQyVUwqU8VPOqx10WGtiw5rXfThh1X8kyqeqLyh8qTiicpUMalMFU8qnlRMKlPFTYe1LjqsddFhrYs+XKbym1TeqHij4hsqU8Wk8g2VJxW/6bDWRYe1LjqsdZH9wVqXHNa66LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOui/wHvgHQZw1RQWgAAAABJRU5ErkJggg==', '2026-05-18 17:27:06', NULL, NULL, NULL),
(27, 'muve', '0781236389', 3, 'active', 5000.00, 2, 'RAB123AA', '2026-05-17 11:26:00', '', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATXSURBVO3BQY4cSRIEQdNA/f/Lun30UwCJ9GqSsyaCP1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtAfpOaCcgTam6APKFmAvKEmhsgv0nNGydVi06qFp1ULfpkmZpNQJ5QMwG5AfKEmgnIpGYCMqmZgExqbtRsArLppGrRSdWik6pFn3wZkCfUvAFkUjMBmdRMQCY1E5BJzRNAJjVvAHlCzTedVC06qVp0UrXok3+cmhsgk5obNROQSc0EZFIzqbkBMqn5l51ULTqpWnRSteiTfxyQJ4DcqLkBMql5Ash/2UnVopOqRSdViz75MjXfpOYNIDdqboBMaiYgk5pNav4mJ1WLTqoWnVQt+mQZkN8EZFIzAZnUPAFkUrMJyKTmBsjf7KRq0UnVopOqRZ+8pOZPUvMEkBsg3wRkUnOj5l9yUrXopGrRSdWiT14CMqm5AfJNajapuVHzhJoJyI2aGyCTmgnIE2reOKladFK16KRqEf7IC0DeUPMEkCfUTEBu1NwA2aRmAvKGmj/ppGrRSdWik6pF+CNfBGRS8wSQGzUTkCfU3ACZ1ExAbtQ8AWRSMwF5Qs1vOqladFK16KRqEf7IIiBPqPkmIJOaGyBPqJmA3Kj5JiCTmgnIpGbTSdWik6pFJ1WLPnkJyI2aCcgEZFIzAZnU3ACZ1ExANgF5AsiNmgnIpGYTkEnNGydVi06qFp1ULfrky4BMaiYgN2omIDdqvknNDZBJzQRkUnOjZgJyo2YCMqmZgGw6qVp0UrXopGrRJ8vUTEAmIJOaCcgTap5QMwG5UTMBmdRMap4A8k1qftNJ1aKTqkUnVYvwR14AsknNDZAbNZuAbFIzAfmbqHnjpGrRSdWik6pFnyxTcwNkUjMBuVEzAZmAvKHmCTUTkEnNE2pugExqJiCTmgnIN51ULTqpWnRSteiTZUAmNZOaGzU3QJ5QcwNkAjKp+ZOATGomIE+o+aaTqkUnVYtOqhZ98mVAJjU3QJ5QMwG5ATKpeQLIG0AmNROQGyCTmgnIBGRSMwGZ1LxxUrXopGrRSdUi/JEXgNyomYDcqLkB8oSaN4BsUjMBmdRMQDap+aaTqkUnVYtOqhZ98mVAJjU3QP4kIE+ouQEyAbkB8oaaCcgNkEnNGydVi06qFp1ULfrkJTWb1DwB5AbIpGYCMqmZgExqJiCTmjfUPAHkRs0E5JtOqhadVC06qVr0yUtAfpOaJ9RMQN4AMqmZgExqJiBPAJnUvKHmm06qFp1ULTqpWvTJMjWbgDyh5pvUvKFmAnKj5gkgk5oJyI2aN06qFp1ULTqpWvTJlwF5Qs0bQCY1N2omIDdAJjU3QJ4A8k1qJiCbTqoWnVQtOqla9Mn/GTUTkEnNDZAbNROQGzVPAJnUPAFkUrPppGrRSdWik6pFn/zj1GwCMqm5AfInAZnUPAFkUvPGSdWik6pFJ1WLPvkyNX8SkEnNpGYC8oaaGyBPAHkCyI2aCcimk6pFJ1WLTqoWfbIMyG8CMql5AsgNkEnNDZBJzaRmAjKpmdTcALlRc6Nm00nVopOqRSdVi/BHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi/4Hr2czS0YdvaYAAAAASUVORK5CYII=', '2026-05-18 17:28:16', NULL, NULL, NULL),
(28, 'manzi bruce', '0788000001', 4, 'active', 7000.00, 3, 'RAB123D', '2026-05-18 18:09:00', '', 'paid', 'data:image/png;base64,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', '2026-05-18 17:39:12', NULL, NULL, NULL),
(29, 'fanny', '0739103597', 6, 'active', 5000.00, 2, 'RAB123F', '2026-05-18 15:06:00', '', 'paid', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATVSURBVO3BQW4kwREEwfDC/P/Lrj3mqYBG55CiFGb4T6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIT1IzAblRMwGZ1ExAnlAzAXlCzQ2Qn6TmjZOqRSdVi06qFn2yTM0mIE+omYBMaiYgT6iZgExqJiCTmgnIpOZGzSYgm06qFp1ULTqpWvTJlwF5Qs0bQCY1N2omIJOaCcik5gkgk5o3gDyh5ptOqhadVC06qVr0yR+nZgJyA+RGzQRkUjMBmdRMam6ATGr+spOqRSdVi06qFn3yxwGZ1HwTkEnNE0D+l51ULTqpWnRSteiTL1PzTWpugExqJiA3am6ATGomIJOaTWr+m5xULTqpWnRSteiTZUB+EpBJzSYgk5pNQCY1N0D+m51ULTqpWnRSteiTl9T8JjU3aiYgk5oJyDcBmdTcqPlLTqoWnVQtOqla9MlLQCY1N0C+Sc2NmifU3Kh5Qs0E5EbNDZBJzQTkCTVvnFQtOqladFK16JOX1NwAmdS8AWQTkEnNDZA3gExqJiA3QJ5Q85NOqhadVC06qVr0yUtAJjU3QN5Q8wSQGzU3QCY1E5AbNTdAJjUTkEnNBGQCMqn5SSdVi06qFp1ULfrkh6m5ATKpeUPNBOQGyA2QSc0EZAKyCcikZgJyA2RSs+mkatFJ1aKTqkWfLAMyqbkBMqmZgNyomYDcqJmA/CVqNgGZ1LxxUrXopGrRSdWiT5apmYDcqLlRMwG5UTMB+U1qJiCTmgnIpGYCcqNmAjKpmYBsOqladFK16KRq0SfLgNyouQHyk9RMQCY1E5AJyKTmCSA3QCY1T6j5SSdVi06qFp1ULfrklwG5UTMBmYC8AWRSMwGZ1ExAJiBvqLkBMqmZgPymk6pFJ1WLTqoWffKSmjfUTEAmIE+oeULNE0AmNROQSc1vUjMB+aaTqkUnVYtOqhZ98hKQGzVPqHkCyATkRs0E5EbNJiCTmhsgk5oJyBNqvumkatFJ1aKTqkWffBmQn6TmBsik5gkgk5o3gDwBZFIzAZmATGomIJOaN06qFp1ULTqpWvTJl6m5ATKpuQHyhpongLwBZFIzAblRMwHZpGbTSdWik6pFJ1WLPvlhQJ4AcqNmAjKpmYBsAjKpmYBMQJ4AcgNkUjMBuQEyqXnjpGrRSdWik6pF+E/+MCCTmieATGomIJOaJ4A8oeYJIJOaGyA3at44qVp0UrXopGrRJy8B+UlqboBMam7UPAFkUjMBmdRMQJ4AMql5Q803nVQtOqladFK16JNlajYB2QRkUvOEmjfUTEBu1DwBZFIzAblR88ZJ1aKTqkUnVYs++TIgT6h5Q80TQJ4AMqm5AfIEkG9SMwHZdFK16KRq0UnVok/+z6l5AsiNmgnIpGYCcqPmDSA3ajadVC06qVp0UrXokz9OzQRkUnMDZFIzAbkB8gSQSc0EZALyTUAmNW+cVC06qVp0UrXoky9T85PUTEBu1GxScwPkRs0EZJOaCcimk6pFJ1WLTqoW4T95AchPUjMBmdQ8AeRGzQ2QGzU3QDap+U0nVYtOqhadVC3Cf1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0H8ikHngrrZy6AAAAAElFTkSuQmCC', '2026-05-18 17:44:46', NULL, NULL, NULL);

--
-- Triggers `passenger_ticket`
--
DELIMITER $$
CREATE TRIGGER `trg_after_ticket_insert` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    UPDATE launch_cars lc
    JOIN company_cars cc
    ON lc.car_plate = cc.car_plate

    SET lc.available_sits =
        cc.total_sits -
        (
            SELECT COUNT(*)
            FROM passenger_ticket pt
            WHERE pt.launch_car_id = NEW.launch_car_id
            AND pt.ticket_life_cycle = 'active'
        )

    WHERE lc.id = NEW.launch_car_id;

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_generate_verification` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    INSERT INTO verification_tokens (
        passenger_ticket_id,
        token,
        verification_code,
        qr_code,
        expires_at
    )
    VALUES (
        NEW.id,

        UUID(),

        CONCAT(
            'ROT-',
            FLOOR(100000 + RAND() * 900000)
        ),

        CONCAT(
            'Passenger:',
            NEW.passenger_name,

            '|Car:',
            NEW.car_plate,

            '|Location:',
            NEW.location_id,

            '|Travel:',
            NEW.travel_time,

            '|Created:',
            NOW()
        ),

        DATE_ADD(NOW(), INTERVAL 1 DAY)
    );

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_insert_car_check` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    DECLARE activeTickets INT;
    DECLARE inactiveTickets INT;
    DECLARE totalSeats INT;
    DECLARE remainingSeats INT;

    
    SELECT COUNT(*)
    INTO activeTickets
    FROM passenger_ticket
    WHERE launch_car_id = NEW.launch_car_id
    AND ticket_life_cycle = 'active';

    
    SELECT COUNT(*)
    INTO inactiveTickets
    FROM passenger_ticket
    WHERE launch_car_id = NEW.launch_car_id
    AND ticket_life_cycle = 'inactive';

    
    SELECT cc.total_sits
    INTO totalSeats
    FROM company_cars cc
    JOIN launch_cars lc
    ON lc.car_plate = cc.car_plate
    WHERE lc.id = NEW.launch_car_id;

    SET remainingSeats = totalSeats - activeTickets;

    INSERT INTO cars_check (
        launch_car_id,
        location_id,
        available_sit,
        expired_total_ticket
    )
    VALUES (
        NEW.launch_car_id,
        NEW.location_id,
        remainingSeats,
        inactiveTickets
    );

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_payment_after_ticket` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    INSERT INTO payments (
        launch_car_id,
        total_amount,
        total_tickets,
        payment_date
    )
    VALUES (
        NEW.launch_car_id,
        NEW.price,
        1,
        CURDATE()
    );

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_available_sits` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    DECLARE totalSeats INT;
    DECLARE bookedSeats INT;
    DECLARE remainingSeats INT;

    
    SELECT cc.total_sits
    INTO totalSeats
    FROM company_cars cc
    JOIN launch_cars lc
    ON lc.car_plate = cc.car_plate
    WHERE lc.id = NEW.launch_car_id;

    
    SELECT COUNT(*)
    INTO bookedSeats
    FROM passenger_ticket
    WHERE launch_car_id = NEW.launch_car_id
    AND ticket_life_cycle = 'active';

    SET remainingSeats = totalSeats - bookedSeats;

    
    UPDATE launch_cars
    SET available_sits = remainingSeats
    WHERE id = NEW.launch_car_id;

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_cars_check` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    DECLARE total_active INT;
    DECLARE total_inactive INT;

    SELECT COUNT(*)
    INTO total_active
    FROM passenger_ticket
    WHERE launch_car_id = NEW.launch_car_id
    AND ticket_life_cycle = 'active';

    SELECT COUNT(*)
    INTO total_inactive
    FROM passenger_ticket
    WHERE launch_car_id = NEW.launch_car_id
    AND ticket_life_cycle = 'inactive';

    INSERT INTO cars_check (
        launch_car_id,
        location_id,
        available_sit,
        expired_total_ticket
    )
    VALUES (
        NEW.launch_car_id,
        NEW.location_id,
        total_active,
        total_inactive
    );

END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_payments` AFTER INSERT ON `passenger_ticket` FOR EACH ROW BEGIN

    IF NEW.payment_status = 'paid' THEN

        INSERT INTO payments (
            launch_car_id,
            total_amount,
            total_tickets,
            payment_date
        )
        VALUES (
            NEW.launch_car_id,
            NEW.price,
            1,
            CURDATE()
        )

        ON DUPLICATE KEY UPDATE
            total_amount = total_amount + NEW.price,
            total_tickets = total_tickets + 1;

    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `launch_car_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `total_tickets` int(11) DEFAULT 0,
  `payment_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `launch_car_id`, `total_amount`, `total_tickets`, `payment_date`, `created_at`) VALUES
(1, 1, 3500.00, 1, '2026-05-15', '2026-05-16 06:52:08'),
(3, 3, 15000.00, 3, '2026-05-18', '2026-05-18 09:57:42'),
(7, 2, 10500.00, 3, '2026-05-18', '2026-05-18 10:09:27'),
(9, 1, 10500.00, 3, '2026-05-18', '2026-05-18 12:17:49'),
(15, 6, 10000.00, 2, '2026-05-18', '2026-05-18 15:31:46'),
(21, 4, 7000.00, 1, '2026-05-18', '2026-05-18 16:48:29'),
(22, 5, 1000.00, 1, '2026-05-18', '2026-05-18 16:50:35'),
(29, 1, 3500.00, 1, '2026-05-18', '2026-05-18 17:26:42'),
(30, 1, 3500.00, 1, '2026-05-18', '2026-05-18 17:26:42'),
(31, 1, 3500.00, 1, '2026-05-18', '2026-05-18 17:26:43'),
(32, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:27:06'),
(33, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:27:06'),
(34, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:27:07'),
(35, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:28:16'),
(36, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:28:16'),
(37, 3, 5000.00, 1, '2026-05-18', '2026-05-18 17:28:17'),
(38, 4, 7000.00, 1, '2026-05-18', '2026-05-18 17:39:12'),
(39, 4, 7000.00, 1, '2026-05-18', '2026-05-18 17:39:12'),
(40, 4, 7000.00, 1, '2026-05-18', '2026-05-18 17:39:13'),
(41, 6, 5000.00, 1, '2026-05-18', '2026-05-18 17:44:46'),
(42, 6, 5000.00, 1, '2026-05-18', '2026-05-18 17:44:46'),
(43, 6, 5000.00, 1, '2026-05-18', '2026-05-18 17:44:46');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `total_cars` int(11) DEFAULT 0,
  `total_drivers` int(11) DEFAULT 0,
  `total_stations` int(11) DEFAULT 0,
  `total_launch_cars` int(11) DEFAULT 0,
  `total_tickets` int(11) DEFAULT 0,
  `active_tickets` int(11) DEFAULT 0,
  `inactive_tickets` int(11) DEFAULT 0,
  `total_income` decimal(12,2) DEFAULT 0.00,
  `total_expired_tickets` int(11) DEFAULT 0,
  `report_type` enum('daily','monthly') DEFAULT 'daily',
  `report_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `company_id`, `total_cars`, `total_drivers`, `total_stations`, `total_launch_cars`, `total_tickets`, `active_tickets`, `inactive_tickets`, `total_income`, `total_expired_tickets`, `report_type`, `report_date`, `created_at`) VALUES
(1, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:35:50'),
(2, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:37:50'),
(3, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:39:50'),
(4, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:41:50'),
(5, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:43:50'),
(6, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:45:50'),
(7, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:47:50'),
(8, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:49:50'),
(9, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:51:50'),
(10, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:53:50'),
(11, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:55:51'),
(12, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:57:51'),
(13, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 09:59:51'),
(14, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:01:51'),
(15, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:03:51'),
(16, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:05:51'),
(17, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:07:51'),
(18, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:09:51'),
(19, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:11:51'),
(20, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:13:51'),
(21, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:15:51'),
(22, 1, 2, 2, 2, 2, 1, 0, 4, 14000.00, 4, 'daily', '2026-05-16', '2026-05-16 10:17:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `roles` enum('admin','company-manager') NOT NULL,
  `avatar_image` text DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `link_of_company_web` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `roles`, `avatar_image`, `company_id`, `phone_number`, `link_of_company_web`, `created_at`) VALUES
(1, 'manager@volcano.com', '12345', 'company-manager', '1779099138240.png', 1, '0788000001', 'https://volcanoexpress.rw', '2026-05-16 06:52:02'),
(2, 'admin@rot.com', 'admin123', 'admin', 'admin.png', NULL, '0788000002', NULL, '2026-05-16 06:52:02'),
(4, 'kivubert@gmail.com', '$2b$10$F6eUuurR8ES9qs185ccusObtAT2N2ayPqs0LJFAsng6eD4IEHggsa', 'company-manager', '1779099162848.png', 1, '0739103590', 'null', '2026-05-16 10:49:25'),
(5, 'kivutress@gmail.com', '$2b$10$Bf1cnl2wKtaVF9HWTOLw2OSboH8ANPvfZ8FogZZd/ThTAcHn/sQT6', 'company-manager', '1778989627065.png', 3, '0739103599', '', '2026-05-17 03:35:04');

-- --------------------------------------------------------

--
-- Table structure for table `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `id` int(11) NOT NULL,
  `passenger_ticket_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `verification_code` varchar(20) NOT NULL,
  `qr_code` text NOT NULL,
  `type` enum('transport_ticket','account_verify','password_reset') DEFAULT 'transport_ticket',
  `status` enum('pending','used','expired') DEFAULT 'pending',
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `verification_tokens`
--

INSERT INTO `verification_tokens` (`id`, `passenger_ticket_id`, `token`, `verification_code`, `qr_code`, `type`, `status`, `expires_at`, `verified_at`, `created_at`) VALUES
(1, 1, 'c2387672-50f3-11f1-97cc-80fa5b38e6ac', 'ROT-112739', 'Passenger:Alice Uwimana|Car:RAB123A|Location:1|Travel:2026-05-16 08:00:00|Created:2026-05-15 23:52:08', 'transport_ticket', 'used', '2026-05-16 23:52:08', '2026-05-15 23:52:09', '2026-05-16 06:52:08'),
(2, 3, '098e4eb2-52a0-11f1-90b9-80fa5b38e6ac', 'ROT-948912', 'Passenger:blazibeat|Car:RAB123AA|Location:2|Travel:2026-05-17 11:26:00|Created:2026-05-18 02:57:42', 'transport_ticket', 'pending', '2026-05-19 02:57:42', NULL, '2026-05-18 09:57:42'),
(3, 3, '1502ecb2-d6e4-432c-948b-a52eda8e016e', 'ROT-525932', 'data:image/png;base64,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', 'transport_ticket', 'pending', '2026-05-19 02:57:48', NULL, '2026-05-18 09:57:48'),
(4, 6, 'aac91c90-52a1-11f1-90b9-80fa5b38e6ac', 'ROT-194024', 'Passenger:ursule |Car:RAC456B|Location:1|Travel:2026-05-18 11:38:00|Created:2026-05-18 03:09:27', 'transport_ticket', 'pending', '2026-05-19 03:09:27', NULL, '2026-05-18 10:09:27'),
(5, 6, 'da3c96a0-c0a4-47b5-88df-736a5a4b6c84', 'ROT-491613', 'data:image/png;base64,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', 'transport_ticket', 'pending', '2026-05-19 03:09:27', NULL, '2026-05-18 10:09:27'),
(6, 7, '99d80552-52b3-11f1-90b9-80fa5b38e6ac', 'ROT-829679', 'Passenger:furah|Car:RAB123AA|Location:1|Travel:2026-05-18 11:42:00|Created:2026-05-18 05:17:49', 'transport_ticket', 'pending', '2026-05-19 05:17:49', NULL, '2026-05-18 12:17:49'),
(7, 7, '72c204fc-4f72-43fc-a5c8-56bd3c52798a', 'ROT-346296', 'data:image/png;base64,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', 'transport_ticket', 'used', '2026-05-19 05:17:50', NULL, '2026-05-18 12:17:50'),
(8, 12, 'b204aedd-52ce-11f1-90b9-80fa5b38e6ac', 'ROT-781018', 'Passenger:manzi bruce|Car:RAB123F|Location:2|Travel:2026-05-18 15:06:00|Created:2026-05-18 08:31:46', 'transport_ticket', 'pending', '2026-05-19 08:31:46', NULL, '2026-05-18 15:31:46'),
(9, 12, 'ca76654a-a52f-4307-b511-f1a65cb128b9', 'ROT-368322', 'data:image/png;base64,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', 'transport_ticket', 'pending', '2026-05-19 08:31:47', NULL, '2026-05-18 15:31:47'),
(10, 17, '6972eb72-52d9-11f1-90b9-80fa5b38e6ac', 'ROT-390526', 'Passenger:ade|Car:RAB123D|Location:3|Travel:2026-05-18 18:09:00|Created:2026-05-18 09:48:29', 'transport_ticket', 'pending', '2026-05-19 09:48:29', NULL, '2026-05-18 16:48:29'),
(11, 18, 'b431aeaa-52d9-11f1-90b9-80fa5b38e6ac', 'ROT-508993', 'Passenger:mapaix|Car:RAC456B|Location:4|Travel:2026-05-18 17:10:00|Created:2026-05-18 09:50:35', 'transport_ticket', 'pending', '2026-05-19 09:50:35', NULL, '2026-05-18 16:50:35'),
(12, 25, 'c03d3605-52de-11f1-90b9-80fa5b38e6ac', 'ROT-166349', 'Passenger:fanny|Car:RAB123AA|Location:1|Travel:2026-05-18 11:42:00|Created:2026-05-18 10:26:42', 'transport_ticket', 'pending', '2026-05-19 10:26:42', NULL, '2026-05-18 17:26:42'),
(13, 25, 'f627b05f-d66c-41ab-9823-2d2c85013277', 'ROT-821310', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAS3SURBVO3BQY4kRxIEQdNA/f/LunP0vQSQSK9mD2ki+EeqlpxULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLPnkJyE9SMwG5UTMBeUPNE0AmNROQSc0E5CepeeOkatFJ1aKTqkWfLFOzCciNmgnIjZoJyI2aTUDeULMJyKaTqkUnVYtOqhZ98mVAnlDzTUBu1ExAbtTcqLkB8gaQJ9R800nVopOqRSdViz75ywGZ1ExAJjVvqLkB8l92UrXopGrRSdWiT/5lgDwB5Akgk5pJzQRkUvNvdlK16KRq0UnVok++TM1PUjMBmYBsAjKpuQEyqXlDzW9yUrXopGrRSdWiT5YB+c3UTEAmNROQSc0E5Ak1E5BJzQ2Q3+ykatFJ1aKTqkX4R/5iQCY1E5AbNZuATGr+S06qFp1ULTqpWvTJS0AmNU8AmdRMQH4SkBs1E5BJzQ2Qn6TmBsik5o2TqkUnVYtOqhZ9sgzIpGYCMqmZgExqngByo+YNIJOaCcik5kbNBORvdlK16KRq0UnVIvwjXwTkn6TmNwMyqXkDyI2aCcik5o2TqkUnVYtOqhbhH/kiIJOaGyCTmgnIpGYC8oaaGyCTmgnIpOYJIJvU/KSTqkUnVYtOqhZ9sgzIpOYNIJOaTWomIDdqbtRMQN5QMwGZ1ExA/kknVYtOqhadVC365CUgk5oJyKTmRs0NkCfUvKHmBsgbaiYgTwCZ1ExAJjUTkEnNGydVi06qFp1ULcI/8gKQGzUTkBs1E5BJzQTkDTVPAHlDzQTkm9TcAJnUvHFSteikatFJ1aJPlql5A8ik5kbNBOQJIE+ouQEyqZmATGomIJOaGyC/yUnVopOqRSdViz5ZBmRSM6m5ATIBmdTcqJmATGomIG8AmdRMQL5JzW9yUrXopGrRSdWiT34YkEnNjZoJyI2aGyCTmgnIE2omIJOaGyCTmhsgN2omIJOabzqpWnRSteikatEnL6m5ATKpeQLIjZoJyKRmAnKj5gbIE0AmNZOaCcgmNT/ppGrRSdWik6pFn3yZmhsgk5obIL+JmieATGomNROQSc0E5Akg33RSteikatFJ1aJPXgJyo2YC8gSQSc0EZFLzBpAbNROQSc0TQJ4AsknNppOqRSdVi06qFuEf+YsB2aRmAnKj5g0gk5ongNyomYBMajadVC06qVp0UrXok5eA/CQ1b6i5AfIEkG8CMqm5UTMBmdRMQCY1b5xULTqpWnRSteiTZWo2AblRcwNkAvKEmhsgk5ongNyoeQLIpGYCMqnZdFK16KRq0UnVok++DMgTap4AMqmZ1NwAeQLIE0CeAPI3O6ladFK16KRq0Sd/OTUTkEnNBGRScwNkUjMBeULNBORGzRtAftJJ1aKTqkUnVYs+qf8DZFIzAZnUTECeUDMBmYBMajYBmdS8cVK16KRq0UnVok++TM1PUvMEkCfUTECeAPJNQCY1E5BvOqladFK16KRq0SfLgPwkIJOaJ9S8oeYGyBNqJiA3QN5Qs+mkatFJ1aKTqkX4R6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYv+B9v4D2MbYX43AAAAAElFTkSuQmCC', 'transport_ticket', 'pending', '2026-05-19 10:26:43', NULL, '2026-05-18 17:26:43'),
(14, 26, 'ce7449e8-52de-11f1-90b9-80fa5b38e6ac', 'ROT-602493', 'Passenger:fannyy|Car:RAB123AA|Location:2|Travel:2026-05-17 11:26:00|Created:2026-05-18 10:27:06', 'transport_ticket', 'pending', '2026-05-19 10:27:06', NULL, '2026-05-18 17:27:06'),
(15, 26, '164f0eb7-bc2c-4022-94c8-59eaf28d2dfb', 'ROT-330480', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAUGSURBVO3BQY4kRxLAQDJQ//8yd45+SiBR0a2R1s3sD9a65LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOuiw1oXffiSym+q+EkqU8Wk8kbFpDJVPFH5TRXfOKx10WGtiw5rXfThsoqbVH6SylQxqUwVT1QmlaliUpkqnlTcpHLTYa2LDmtddFjrog8/TOWNim+oTBWTylTxpGJSmSq+UfENlTcqftJhrYsOa110WOuiD/9xKlPFE5Wp4o2KJypTxX/JYa2LDmtddFjrog//MRWTyhOVJypTxRsq/08Oa110WOuiw1oXffhhFT9JZap4ojJVTCpTxaTypGKqmFRuqvibHNa66LDWRYe1LvpwmcrfrGJSmSomlaliUnmiMlVMKlPFE5W/2WGtiw5rXXRY66IPX6r4J1VMKlPFpDJV/KSKJxVPKv5NDmtddFjrosNaF334kspU8URlqphUnlRMKm9UTCpTxTdUpoo3VKaKSWWq+Jsc1rrosNZFh7Uu+nCZypOKSWWqeKPiDZUnKlPFpPINlScVk8pU8UTlGxXfOKx10WGtiw5rXWR/8AWVb1Q8UZkqnqhMFW+oPKl4Q+VJxROVNyqeqEwVNx3Wuuiw1kWHtS6yP/hBKt+omFSmiknlJ1VMKlPFGypTxRsqU8WkMlVMKlPFNw5rXXRY66LDWhd9+MtUTCpPVJ5UTCpPKiaVJxXfqJhU3qh4UvGbDmtddFjrosNaF9kffEFlqnhDZaq4SWWq+IbKk4pJ5UnFTSpTxaQyVdx0WOuiw1oXHda66MOXKiaVJxVvqEwVk8pUMVU8UZkqnlRMKm9UPFGZKiaVqeIbKlPFNw5rXXRY66LDWhd9+JLKk4pJZap4UvENlTdUpopJ5YnKVHFTxaQyVTyp+EmHtS46rHXRYa2LPlxW8aRiUvlJFZPKVDGpTCpTxaQyVUwqTyq+UfENlaniG4e1LjqsddFhrYs+fKnipoonKlPFE5VvVDypmFSmiicqU8UTlaniicpvOqx10WGtiw5rXfThSypTxaQyVUwVk8pvUpkqJpWpYlKZKt6oeKIyVfzNDmtddFjrosNaF334UsUbKm9UTCpPVN6omFS+oTJVvKEyVTxRmSqmiknlJx3Wuuiw1kWHtS6yP/iCylTxhspUMalMFW+oPKl4Q+UbFZPK36TiG4e1LjqsddFhrYs+fKniGxVPKp6oPKl4Q2WqeKNiUnmj4g2VNyp+0mGtiw5rXXRY66IPX1L5TRVTxaQyqTypeKIyVUwqTyq+oTJVvFExqUwVNx3Wuuiw1kWHtS76cFnFTSpPVKaKN1S+UTGpTBWTyhsVb1RMKlPFpDJVfOOw1kWHtS46rHXRhx+m8kbFGxWTyjcqJpUnKlPFk4pJZVK5qWJS+UmHtS46rHXRYa2LPvzLqUwVk8pUMalMKlPFpPJE5UnFk4pJ5Q2VqWKqmFRuOqx10WGtiw5rXfThX67iDZUnFZPKVPFEZap4UvFGxaQyVUwqU8VPOqx10WGtiw5rXfThh1X8kyqeqLyh8qTiicpUMalMFU8qnlRMKlPFTYe1LjqsddFhrYs+XKbym1TeqHij4hsqU8Wk8g2VJxW/6bDWRYe1LjqsdZH9wVqXHNa66LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOui/wHvgHQZw1RQWgAAAABJRU5ErkJggg==', 'transport_ticket', 'pending', '2026-05-19 10:27:07', NULL, '2026-05-18 17:27:07'),
(16, 27, 'f7e6bd15-52de-11f1-90b9-80fa5b38e6ac', 'ROT-613421', 'Passenger:muve|Car:RAB123AA|Location:2|Travel:2026-05-17 11:26:00|Created:2026-05-18 10:28:16', 'transport_ticket', 'pending', '2026-05-19 10:28:16', NULL, '2026-05-18 17:28:16'),
(17, 27, 'f6ab2649-e8f0-44d6-83c8-2af5e5eac2dc', 'ROT-514215', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATXSURBVO3BQY4cSRIEQdNA/f/Lun30UwCJ9GqSsyaCP1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtAfpOaCcgTam6APKFmAvKEmhsgv0nNGydVi06qFp1ULfpkmZpNQJ5QMwG5AfKEmgnIpGYCMqmZgExqbtRsArLppGrRSdWik6pFn3wZkCfUvAFkUjMBmdRMQCY1E5BJzRNAJjVvAHlCzTedVC06qVp0UrXok3+cmhsgk5obNROQSc0EZFIzqbkBMqn5l51ULTqpWnRSteiTfxyQJ4DcqLkBMql5Ash/2UnVopOqRSdViz75MjXfpOYNIDdqboBMaiYgk5pNav4mJ1WLTqoWnVQt+mQZkN8EZFIzAZnUPAFkUrMJyKTmBsjf7KRq0UnVopOqRZ+8pOZPUvMEkBsg3wRkUnOj5l9yUrXopGrRSdWiT14CMqm5AfJNajapuVHzhJoJyI2aGyCTmgnIE2reOKladFK16KRqEf7IC0DeUPMEkCfUTEBu1NwA2aRmAvKGmj/ppGrRSdWik6pF+CNfBGRS8wSQGzUTkCfU3ACZ1ExAbtQ8AWRSMwF5Qs1vOqladFK16KRqEf7IIiBPqPkmIJOaGyBPqJmA3Kj5JiCTmgnIpGbTSdWik6pFJ1WLPnkJyI2aCcgEZFIzAZnU3ACZ1ExANgF5AsiNmgnIpGYTkEnNGydVi06qFp1ULfrky4BMaiYgN2omIDdqvknNDZBJzQRkUnOjZgJyo2YCMqmZgGw6qVp0UrXopGrRJ8vUTEAmIJOaCcgTap5QMwG5UTMBmdRMap4A8k1qftNJ1aKTqkUnVYvwR14AsknNDZAbNZuAbFIzAfmbqHnjpGrRSdWik6pFnyxTcwNkUjMBuVEzAZmAvKHmCTUTkEnNE2pugExqJiCTmgnIN51ULTqpWnRSteiTZUAmNZOaGzU3QJ5QcwNkAjKp+ZOATGomIE+o+aaTqkUnVYtOqhZ98mVAJjU3QJ5QMwG5ATKpeQLIG0AmNROQGyCTmgnIBGRSMwGZ1LxxUrXopGrRSdUi/JEXgNyomYDcqLkB8oSaN4BsUjMBmdRMQDap+aaTqkUnVYtOqhZ98mVAJjU3QP4kIE+ouQEyAbkB8oaaCcgNkEnNGydVi06qFp1ULfrkJTWb1DwB5AbIpGYCMqmZgExqJiCTmjfUPAHkRs0E5JtOqhadVC06qVr0yUtAfpOaJ9RMQN4AMqmZgExqJiBPAJnUvKHmm06qFp1ULTqpWvTJMjWbgDyh5pvUvKFmAnKj5gkgk5oJyI2aN06qFp1ULTqpWvTJlwF5Qs0bQCY1N2omIDdAJjU3QJ4A8k1qJiCbTqoWnVQtOqla9Mn/GTUTkEnNDZAbNROQGzVPAJnUPAFkUrPppGrRSdWik6pFn/zj1GwCMqm5AfInAZnUPAFkUvPGSdWik6pFJ1WLPvkyNX8SkEnNpGYC8oaaGyBPAHkCyI2aCcimk6pFJ1WLTqoWfbIMyG8CMql5AsgNkEnNDZBJzaRmAjKpmdTcALlRc6Nm00nVopOqRSdVi/BHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi/4Hr2czS0YdvaYAAAAASUVORK5CYII=', 'transport_ticket', 'pending', '2026-05-19 10:28:16', NULL, '2026-05-18 17:28:16'),
(18, 28, '7efb409f-52e0-11f1-90b9-80fa5b38e6ac', 'ROT-259624', 'Passenger:manzi bruce|Car:RAB123D|Location:3|Travel:2026-05-18 18:09:00|Created:2026-05-18 10:39:12', 'transport_ticket', 'pending', '2026-05-19 10:39:12', NULL, '2026-05-18 17:39:12'),
(19, 28, 'd7cab927-cd4c-482a-b6a6-29f6ab3b1964', 'ROT-476744', 'data:image/png;base64,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', 'transport_ticket', 'pending', '2026-05-19 10:39:12', NULL, '2026-05-18 17:39:12'),
(20, 29, '45d17af0-52e1-11f1-90b9-80fa5b38e6ac', 'ROT-257858', 'Passenger:fanny|Car:RAB123F|Location:2|Travel:2026-05-18 15:06:00|Created:2026-05-18 10:44:46', 'transport_ticket', 'pending', '2026-05-19 10:44:46', NULL, '2026-05-18 17:44:46'),
(21, 29, '50489cdc-6400-4ab4-aee4-7a4d46484a5d', 'ROT-663555', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATVSURBVO3BQW4kwREEwfDC/P/Lrj3mqYBG55CiFGb4T6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIT1IzAblRMwGZ1ExAnlAzAXlCzQ2Qn6TmjZOqRSdVi06qFn2yTM0mIE+omYBMaiYgT6iZgExqJiCTmgnIpOZGzSYgm06qFp1ULTqpWvTJlwF5Qs0bQCY1N2omIJOaCcik5gkgk5o3gDyh5ptOqhadVC06qVr0yR+nZgJyA+RGzQRkUjMBmdRMam6ATGr+spOqRSdVi06qFn3yxwGZ1HwTkEnNE0D+l51ULTqpWnRSteiTL1PzTWpugExqJiA3am6ATGomIJOaTWr+m5xULTqpWnRSteiTZUB+EpBJzSYgk5pNQCY1N0D+m51ULTqpWnRSteiTl9T8JjU3aiYgk5oJyDcBmdTcqPlLTqoWnVQtOqla9MlLQCY1N0C+Sc2NmifU3Kh5Qs0E5EbNDZBJzQTkCTVvnFQtOqladFK16JOX1NwAmdS8AWQTkEnNDZA3gExqJiA3QJ5Q85NOqhadVC06qVr0yUtAJjU3QN5Q8wSQGzU3QCY1E5AbNTdAJjUTkEnNBGQCMqn5SSdVi06qFp1ULfrkh6m5ATKpeUPNBOQGyA2QSc0EZAKyCcikZgJyA2RSs+mkatFJ1aKTqkWfLAMyqbkBMqmZgNyomYDcqJmA/CVqNgGZ1LxxUrXopGrRSdWiT5apmYDcqLlRMwG5UTMB+U1qJiCTmgnIpGYCcqNmAjKpmYBsOqladFK16KRq0SfLgNyouQHyk9RMQCY1E5AJyKTmCSA3QCY1T6j5SSdVi06qFp1ULfrklwG5UTMBmYC8AWRSMwGZ1ExAJiBvqLkBMqmZgPymk6pFJ1WLTqoWffKSmjfUTEAmIE+oeULNE0AmNROQSc1vUjMB+aaTqkUnVYtOqhZ98hKQGzVPqHkCyATkRs0E5EbNJiCTmhsgk5oJyBNqvumkatFJ1aKTqkWffBmQn6TmBsik5gkgk5o3gDwBZFIzAZmATGomIJOaN06qFp1ULTqpWvTJl6m5ATKpuQHyhpongLwBZFIzAblRMwHZpGbTSdWik6pFJ1WLPvlhQJ4AcqNmAjKpmYBsAjKpmYBMQJ4AcgNkUjMBuQEyqXnjpGrRSdWik6pF+E/+MCCTmieATGomIJOaJ4A8oeYJIJOaGyA3at44qVp0UrXopGrRJy8B+UlqboBMam7UPAFkUjMBmdRMQJ4AMql5Q803nVQtOqladFK16JNlajYB2QRkUvOEmjfUTEBu1DwBZFIzAblR88ZJ1aKTqkUnVYs++TIgT6h5Q80TQJ4AMqm5AfIEkG9SMwHZdFK16KRq0UnVok/+z6l5AsiNmgnIpGYCcqPmDSA3ajadVC06qVp0UrXokz9OzQRkUnMDZFIzAbkB8gSQSc0EZALyTUAmNW+cVC06qVp0UrXoky9T85PUTEBu1GxScwPkRs0EZJOaCcimk6pFJ1WLTqoW4T95AchPUjMBmdQ8AeRGzQ2QGzU3QDap+U0nVYtOqhadVC3Cf1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0H8ikHngrrZy6AAAAAElFTkSuQmCC', 'transport_ticket', 'used', '2026-05-19 10:44:46', NULL, '2026-05-18 17:44:46');

-- --------------------------------------------------------

--
-- Structure for view `daily_company_report`
--
DROP TABLE IF EXISTS `daily_company_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_company_report`  AS SELECT `c`.`id` AS `company_id`, `c`.`name` AS `company_name`, count(distinct `cc`.`id`) AS `total_cars`, count(distinct `cd`.`id`) AS `total_drivers`, count(distinct `cs`.`id`) AS `total_stations`, count(distinct `lc`.`id`) AS `total_launch_cars`, count(distinct `pt`.`id`) AS `total_tickets`, sum(case when `pt`.`ticket_life_cycle` = 'active' then 1 else 0 end) AS `active_tickets`, sum(case when `pt`.`ticket_life_cycle` = 'inactive' then 1 else 0 end) AS `inactive_tickets`, sum(`pt`.`price`) AS `total_income` FROM ((((((`company` `c` left join `users` `u` on(`u`.`company_id` = `c`.`id`)) left join `company_cars` `cc` on(`cc`.`user_id` = `u`.`id`)) left join `company_driver` `cd` on(`cd`.`user_id` = `u`.`id`)) left join `company_station` `cs` on(`cs`.`user_id` = `u`.`id`)) left join `launch_cars` `lc` on(`lc`.`car_plate` = `cc`.`car_plate`)) left join `passenger_ticket` `pt` on(`pt`.`launch_car_id` = `lc`.`id`)) GROUP BY `c`.`id` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cars_check`
--
ALTER TABLE `cars_check`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_carcheck_launch` (`launch_car_id`),
  ADD KEY `fk_carcheck_location` (`location_id`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `company_cars`
--
ALTER TABLE `company_cars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `car_plate` (`car_plate`),
  ADD KEY `fk_company_cars_user` (`user_id`);

--
-- Indexes for table `company_driver`
--
ALTER TABLE `company_driver`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `fk_driver_user` (`user_id`);

--
-- Indexes for table `company_station`
--
ALTER TABLE `company_station`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_station_user` (`user_id`);

--
-- Indexes for table `driver_locations`
--
ALTER TABLE `driver_locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_driver` (`driver_id`),
  ADD KEY `idx_driver_location` (`driver_id`,`status`);

--
-- Indexes for table `launch_cars`
--
ALTER TABLE `launch_cars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_launch_car_plate` (`car_plate`),
  ADD KEY `fk_launch_location` (`location_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `passenger_ticket`
--
ALTER TABLE `passenger_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_launch_car` (`launch_car_id`),
  ADD KEY `fk_ticket_location` (`location_id`),
  ADD KEY `fk_ticket_car` (`car_plate`),
  ADD KEY `idx_ticket_status` (`ticket_life_cycle`,`launch_car_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_launch_car_date` (`launch_car_id`,`payment_date`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reports_company` (`company_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `fk_users_company` (`company_id`);

--
-- Indexes for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `verification_code` (`verification_code`),
  ADD KEY `fk_verification_ticket` (`passenger_ticket_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cars_check`
--
ALTER TABLE `cars_check`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `company_cars`
--
ALTER TABLE `company_cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `company_driver`
--
ALTER TABLE `company_driver`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `company_station`
--
ALTER TABLE `company_station`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `driver_locations`
--
ALTER TABLE `driver_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `launch_cars`
--
ALTER TABLE `launch_cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `passenger_ticket`
--
ALTER TABLE `passenger_ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cars_check`
--
ALTER TABLE `cars_check`
  ADD CONSTRAINT `fk_carcheck_launch` FOREIGN KEY (`launch_car_id`) REFERENCES `launch_cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carcheck_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company_cars`
--
ALTER TABLE `company_cars`
  ADD CONSTRAINT `fk_company_cars_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company_driver`
--
ALTER TABLE `company_driver`
  ADD CONSTRAINT `fk_driver_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company_station`
--
ALTER TABLE `company_station`
  ADD CONSTRAINT `fk_station_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `driver_locations`
--
ALTER TABLE `driver_locations`
  ADD CONSTRAINT `driver_locations_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `company_driver` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `launch_cars`
--
ALTER TABLE `launch_cars`
  ADD CONSTRAINT `fk_launch_car_plate` FOREIGN KEY (`car_plate`) REFERENCES `company_cars` (`car_plate`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_launch_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `passenger_ticket`
--
ALTER TABLE `passenger_ticket`
  ADD CONSTRAINT `fk_ticket_car` FOREIGN KEY (`car_plate`) REFERENCES `company_cars` (`car_plate`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ticket_launch_car` FOREIGN KEY (`launch_car_id`) REFERENCES `launch_cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ticket_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_launch` FOREIGN KEY (`launch_car_id`) REFERENCES `launch_cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD CONSTRAINT `fk_verification_ticket` FOREIGN KEY (`passenger_ticket_id`) REFERENCES `passenger_ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
