CREATE DATABASE  IF NOT EXISTS `pinup`;
USE `pinup`;

DROP TABLE IF EXISTS `accesstracker`;
CREATE TABLE `accesstracker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nSitesID` int(11) DEFAULT NULL,
  `nRegimageID` int(11) DEFAULT NULL,
  `nAccessType` tinyint(4) DEFAULT NULL,
  `strIpAddress` varchar(15) DEFAULT NULL,
  `dateCreated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `strTPID` varchar(26) DEFAULT NULL,
  `strEmail` varchar(256) DEFAULT NULL,
  `strFullName` varchar(256) DEFAULT NULL,
  `strPassword512` varchar(128) DEFAULT NULL,
  `strSalt` varchar(8) DEFAULT NULL,
  `nFailedLoginAttempts` tinyint(4) DEFAULT NULL,
  `dateLastLoginAttempt` timestamp NULL DEFAULT NULL,
  `dateRegistered` timestamp NULL DEFAULT NULL,
  `bStatus` tinyint(4) DEFAULT 1,
  `bEmailVerified` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `accountssites`;
CREATE TABLE `accountssites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `nAccountsID` int(11) DEFAULT NULL,
  `nSitesID` int(11) DEFAULT NULL,
  `bVerified` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `blockedregistrations`;
CREATE TABLE `blockedregistrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strEmail` varchar(256) DEFAULT NULL,
  `strIpAddress` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `keywords`;
CREATE TABLE `keywords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strKeyword` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `regimage`;
CREATE TABLE `regimage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strImagePath` varchar(256) DEFAULT NULL,
  `nSitesID` int(11) DEFAULT NULL,
  `strHash` varchar(32) DEFAULT NULL,
  `dateCreated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sites`;
CREATE TABLE `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `strSiteName` varchar(256) DEFAULT NULL,
  `strURL` varchar(256) DEFAULT NULL,
  `bVerified` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sitesalias`;
CREATE TABLE `sitesalias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nSitesID` int(11) DEFAULT NULL,
  `nAliasSitesID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sitessettings`;
CREATE TABLE `sitessettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nSitesID` int(11) DEFAULT NULL,
  `nMinWidth` int(11) DEFAULT NULL,
  `nMinHeight` int(11) DEFAULT NULL,
  `jsonpTimeout` int(11) DEFAULT NULL,
  `scrollDelay` int(11) DEFAULT NULL,
  `navAniSpeed` int(11) DEFAULT NULL,
  `loadAll` tinyint(4) DEFAULT NULL,
  `smartLoad` tinyint(4) DEFAULT NULL,
  `forceListen` tinyint(4) DEFAULT NULL,
  `alwaysShowTags` tinyint(4) DEFAULT NULL,
  `cssHelper` tinyint(4) DEFAULT NULL,
  `posHelper` tinyint(4) DEFAULT NULL,
  `animations` tinyint(4) DEFAULT NULL,
  `keyListener` tinyint(4) DEFAULT NULL,
  `themeFile` varchar(100) DEFAULT NULL,
  `allowFile` varchar(100) DEFAULT NULL,
  `allowThemeManager` tinyint(4) DEFAULT NULL,
  `allowLocalStorage` tinyint(4) DEFAULT NULL,
  `allowBottomLinks` tinyint(4) DEFAULT NULL,
  `allowShare` tinyint(4) DEFAULT NULL,
  `dotSize` varchar(100) DEFAULT NULL,
  `dotOutlineSize` int(11) DEFAULT NULL,
  `canvas` blob,
  `canvas.cornerRadius` int(11) DEFAULT NULL,
  `canvas.tailWidth` int(11) DEFAULT NULL,
  `canvas.tailHeight` int(11) DEFAULT NULL,
  `canvas.stroke` tinyint(4) DEFAULT NULL,
  `canvas.shadow` tinyint(4) DEFAULT NULL,
  `canvas.theme` blob,
  `canvas.theme.backgroundStyle` varchar(100) DEFAULT NULL,
  `canvas.theme.backgroundColor` varchar(100) DEFAULT NULL,
  `canvas.theme.strokeWidth` int(11) DEFAULT NULL,
  `canvas.theme.strokeColor` varchar(100) DEFAULT NULL,
  `canvas.theme.shadowOffsetX` int(11) DEFAULT NULL,
  `canvas.theme.shadowOffsetY` int(11) DEFAULT NULL,
  `canvas.theme.shadowBlur` int(11) DEFAULT NULL,
  `canvas.theme.shadowColor` varchar(100) DEFAULT NULL,
  `tooltip` tinyint(4) DEFAULT NULL,
  `tooltipOrientation` varchar(100) DEFAULT NULL,
  `tooltipURL` tinyint(4) DEFAULT NULL,
  `altImageSrc` varchar(100) DEFAULT NULL,
  `activeParentClass` varchar(100) DEFAULT NULL,
  `activeChildClass` varchar(100) DEFAULT NULL,
  `custom` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `strTagName` varchar(256) DEFAULT NULL,
  `strWebLink` varchar(256) DEFAULT NULL,
  `strWebReferer` varchar(256) DEFAULT NULL,
  `strKeywordsMap` blob,
  `nPosX` decimal(10,10) DEFAULT NULL,
  `nPosY` decimal(10,10) DEFAULT NULL,
  `nRegimageID` int(11) DEFAULT NULL,
  `nSitesID` int(11) DEFAULT NULL,
  `nTaggerAccountsID` int(11) DEFAULT NULL,
  `nUserAgentsID` int(11) DEFAULT NULL,
  `strIpAddress` varchar(15) DEFAULT NULL,
  `dateCreated` timestamp NULL DEFAULT NULL,
  `bApproved` tinyint(4) DEFAULT 0,
  `bDeleted` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tagslog`;
CREATE TABLE `tagslog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nTagsID` int(11) DEFAULT NULL,
  `strClickerIP` varchar(15) DEFAULT NULL,
  `nUserAgentsID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `clicklog`;
CREATE TABLE `clicklog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nAccountsID` int(11) DEFAULT NULL,
  `nTagClickedID` int(11) DEFAULT NULL,
  `nSiteClickedFromID` int(11) DEFAULT NULL,
  `nSiteClickedToID` int(11) DEFAULT NULL,
  `nUserAgentsID` int(11) DEFAULT NULL,
  `strWebLink` varchar(256) DEFAULT NULL,
  `strWebReferer` varchar(256) DEFAULT NULL,
  `strClickerIP` varchar(15) DEFAULT NULL,
  `dateClicked` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `useragents`;
CREATE TABLE `useragents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strAgentHash` varchar(32) DEFAULT NULL,
  `strUserAgent` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
