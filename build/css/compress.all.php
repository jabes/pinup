<?php

//header("content-type:text/plain");
header("content-type:text/css");

require_once dirname(__FILE__) . "/../../gateway/php/config.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Ftp.class.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Util.class.php";
require_once dirname(__FILE__) . "/includes/class.CodeBuilder.php";

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(10);



function resp($msg) {
	echo "[" . date("Y/m/d h:i:s A") . "] " . $msg . PHP_EOL;
}


try {
	
	$ftp = new Ftp(FTP_HOST, FTP_USER, FTP_PASS);

	$dir_root = "/subdomains/flairdev/httpdocs/css";
	$dir_themes = "{$dir_root}/themes";
	$dir_output = $ftp->createDirectory("{$dir_root}/compressed");
	$dir_backups = $ftp->createDirectory("{$dir_root}/backups");

	$themes = array("default" => "{$dir_root}/base.css");
	
	// GET THE THEMES WE WILL NEED
	foreach($ftp->listDirectory($dir_themes) as $path) {	
		$parts = explode('.', $path);
		$themes[$parts[1]] = $path;
	}
	
	print_r($themes);

	// DO SOME BACKUPS FIRST
	foreach (array_keys($themes) as $theme) {
		$timestamp = date("Ymd_His_");
		$path1 = "{$dir_output}/{$theme}.css";
		$path2 = "{$dir_backups}/{$timestamp}{$theme}.css.bak";
		if ($ftp->fileExists($path1)) {
			$ftp->fileMove($path1, $path2);
			resp("Backup File Path: {$path2}");
		}
	}

	// OK COOL NOW YOU CAN OVERWRITE
	$ftp->changeDirectory($dir_output);
	foreach (array_keys($themes) as $theme) {
	
		$ocss = new CodeBuilder(true, $theme);
		$output = $ocss->output();
		$output = str_replace("#PIN_active", "#PIN_active.PIN_{$theme}Theme", $output);
		
		$fileName = "{$theme}.css";
		$ftp->fileWrite($fileName, $output);
		resp("Output File Path: {$dir_output}/{$fileName}");

	}


} catch (FtpException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UtilException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (Exception $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
}