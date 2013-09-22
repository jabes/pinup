<?php

header("content-type:text");

require_once dirname(__FILE__) . "/../../gateway/php/config.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Ftp.class.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Util.class.php";
require_once dirname(__FILE__) . "/includes/class.CodeBuilder.php";

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(10);

$fileNameLive = strtolower(SYS_NAME) . '.js';
$fileNameDev = strtolower(SYS_NAME) . '.dev.js';
$files = array(
	$fileNameLive => array(
		'golive' => true,
		'debugOn' => false
	),
	$fileNameDev => array(
		'golive' => true,
		'debugOn' => true
	)
);

function resp($msg) {
	echo "[" . date("Y/m/d h:i:s A") . "] " . $msg . PHP_EOL;
}


try {

	$ftp = new Ftp(FTP_HOST, FTP_USER, FTP_PASS);
	$dir_output = $ftp->createDirectory("/subdomains/flairdev/httpdocs/js/compressed");
	$dir_backups = $ftp->createDirectory("/subdomains/flairdev/httpdocs/js/backups");
	

	// DO SOME BACKUPS FIRST
	foreach (array_keys($files) as $fileName) {
		$timestamp = date("Ymd_His_");
		$path1 = "{$dir_output}/{$fileName}";
		$path2 = "{$dir_backups}/{$timestamp}{$fileName}.bak";
		if ($ftp->fileExists($path1)) {
			$ftp->fileMove($path1, $path2);
			resp("Backup File Path: {$path2}");
		}
	}

	// OK COOL NOW YOU CAN OVERWRITE
	$ftp->changeDirectory($dir_output);
	foreach ($files as $fileName => $fileProperties) {
		$ojs = new CodeBuilder($fileProperties['golive'], $fileProperties['debugOn']);
		$ftp->fileWrite($fileName, $ojs->output());
		resp("Output File Path: {$dir_output}/{$fileName}");
	}


} catch (FtpException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UtilException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (Exception $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
}
