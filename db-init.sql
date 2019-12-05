CREATE DATABASE IF NOT EXISTS `pwadb` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `pwadb`;

CREATE TABLE IF NOT EXISTS `users` (
  `RowId` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` char(36) NOT NULL,
  `Email` varchar(128) NOT NULL,
  `PassHash` varchar(128) NOT NULL,
  `Confirm` char(32) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1', -- Default to 0 if you want to require email confirmation
  `Role` enum('user','admin') NOT NULL DEFAULT 'user',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `RowId_UNIQUE` (`RowId`),
  UNIQUE KEY `UserId_UNIQUE` (`UserId`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sessions` (
  `SessionId` int(11) NOT NULL AUTO_INCREMENT,
  `SessionKey` char(32) NOT NULL,
  `UserId` char(36) NOT NULL,
  `Expires` TIMESTAMP NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUsed` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UserAgent` text,
  PRIMARY KEY (`SessionId`),
  UNIQUE KEY `SessionId_UNIQUE` (`SessionId`),
  UNIQUE KEY `SessionKey_UNIQUE` (`SessionKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
