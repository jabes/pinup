CREATE DATABASE  IF NOT EXISTS `pinup` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `pinup`;
-- MySQL dump 10.13  Distrib 5.5.32, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: pinup
-- ------------------------------------------------------
-- Server version	5.5.31-0ubuntu0.12.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accesstracker`
--

DROP TABLE IF EXISTS `accesstracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accesstracker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nSitesID` int(11) DEFAULT NULL,
  `nRegimageID` int(11) DEFAULT NULL,
  `nAccessType` tinyint(4) DEFAULT NULL,
  `strIpAddress` varchar(15) DEFAULT NULL,
  `dateCreated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accountssites`
--

DROP TABLE IF EXISTS `accountssites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accountssites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `nAccountsID` int(11) DEFAULT NULL,
  `nSitesID` int(11) DEFAULT NULL,
  `bVerified` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blockedregistrations`
--

DROP TABLE IF EXISTS `blockedregistrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blockedregistrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strEmail` varchar(256) DEFAULT NULL,
  `strIpAddress` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `keywords`
--

DROP TABLE IF EXISTS `keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keywords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strKeyword` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `regimage`
--

DROP TABLE IF EXISTS `regimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `regimage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strImagePath` varchar(256) DEFAULT NULL,
  `nSitesID` int(11) DEFAULT NULL,
  `strHash` varchar(32) DEFAULT NULL,
  `dateCreated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strGUID` varchar(36) DEFAULT NULL,
  `strSiteName` varchar(256) DEFAULT NULL,
  `strURL` varchar(256) DEFAULT NULL,
  `bVerified` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sitesalias`
--

DROP TABLE IF EXISTS `sitesalias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sitesalias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nSitesID` int(11) DEFAULT NULL,
  `nAliasSitesID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sitessettings`
--

DROP TABLE IF EXISTS `sitessettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tagslog`
--

DROP TABLE IF EXISTS `tagslog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tagslog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nTagsID` int(11) DEFAULT NULL,
  `strClickerIP` varchar(15) DEFAULT NULL,
  `nUserAgentsID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clicklog`
--

DROP TABLE IF EXISTS `clicklog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `useragents`
--

DROP TABLE IF EXISTS `useragents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `useragents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strAgentHash` varchar(32) DEFAULT NULL,
  `strUserAgent` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-09-22 20:28:52
