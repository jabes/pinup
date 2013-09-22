<?php

header("content-type: application/x-javascript"); 

require_once dirname(__FILE__) . "/../../gateway/php/config.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Util.class.php";
require_once dirname(__FILE__) . "/includes/class.CodeBuilder.php";

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(10);

$golive = (isset($_GET['live']) && $_GET['live'] == "true") ? true : false;
$debugOn = (isset($_GET['debug']) && $_GET['debug'] == "true") ? true : false;

try {

	$ojs = new CodeBuilder($golive, $debugOn);
	echo $ojs->output();

} catch (UtilException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (Exception $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
}
