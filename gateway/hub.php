<?php

/***

THIS FILE IS A HUB FOR THE FRONT END JSONP
all files accessed from the frontend must pass through this file

**/

header("content-type:text/plain");

// disable deprecated warnings
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE | E_STRICT);

require_once dirname(__FILE__) . "/php/jsonwrapper.php";
require_once dirname(__FILE__) . "/php/config.php";

set_time_limit(10); #limits the maximum execution time in seconds

session_name(SESS_NAME); #required for cross-subdomain sessions
session_set_cookie_params(0, "/", "." . SYS_DOMAIN); #make sure incoming connections are not an IP address
session_start();

function classLoader($classname) {
	if (!include(sprintf(CLASS_FILE_LOCATION, $classname))) if (DEVMODE) echo "Unable to load class '{$classname}'" . PHP_EOL;
}
spl_autoload_register("classLoader");


// identity function, returns its argument unmodified.
function o($o) { return $o; }

$HUB_USER_TPID = isset($_SESSION['SESSKEY_USER_TEMPID']) ? $_SESSION['SESSKEY_USER_TEMPID'] : null;
$HUB_USER_IP = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
$HUB_USER_AGENT = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;
$HUB_REFERER = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;

try {

	$connSlave = new Connection(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB);
	// note: $_REQUEST data is alread urldecoded
	$urldata = Connection::cleanData($_REQUEST);

	if (isset($urldata['jsid'])) {
		$HUB_JSONP_ID = $urldata['jsid']; 
		unset($urldata['jsid']);
	}
	if (isset($urldata['pk'])) {
		$HUB_PUBLIC_KEY = $urldata['pk'];
		unset($urldata['pk']);
	}
	if (isset($urldata['r'])) {
		$HUB_FILE = $urldata['r'];
		unset($urldata['r']);
	}

	if (!isset($HUB_FILE)) throw new Exception('Missing hub method parameter');

	// make sure all needed url vars were provided
	// if one of multiple vars are required, but not all of them, then seperate the var names with a slash
	$HUB_REQUIRED_PARAMS = array();
	$required_params = unserialize(REQUIRED_PARAMS);
	foreach ($required_params[$HUB_FILE] as $k) {
		$a = explode("/", $k); // split potential conditional parameters
		$b = true;
		foreach ($a as $s) {
			if (isset($urldata[$s])) {
				$b = false;
				$HUB_REQUIRED_PARAMS[] = $s;
			}
		}
		if ($b) throw new Exception("Insufficient information to perform this action");
	}

	$HUB_RETURN_FORMAT = isset($HUB_JSONP_ID) ? "jsonp" : "json";
	
	// if defined overwrite return format
	if (isset($urldata['f'])) {
		$HUB_RETURN_FORMAT = $urldata['f'];
		unset($urldata['f']);
	}
	
	switch ($HUB_RETURN_FORMAT) {
		case "jsonp":
		case "json":
			$HEADER_CONTENT_TYPE = "application/x-javascript";
			break;
		default:
			$HEADER_CONTENT_TYPE = "text/plain";
			break;
	}

	header("content-type:" . $HEADER_CONTENT_TYPE);
	
	if (isset($HUB_PUBLIC_KEY)) {

		$site = new Site($HUB_PUBLIC_KEY);
		$site->domainExceptions = unserialize(VALID_DOMAIN_EXCEPTIONS);
		$site->referer = $HUB_REFERER;
		$site->ipaddr = $HUB_USER_IP;
		$arrSiteData = $site->retrieveData();
		$site->verify();

		if (!DEVMODE) {
			$site->checkHost();
			$site->checkSubdomain(true); // passive on
		}

	}

	// HUB WILL NOW INCLUDE REQUESTED FILE
	if (!include(sprintf(HUB_FILE_LOCATION, $HUB_FILE))) throw new Exception('The requested file does not exist');

} catch (CacheException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (ConnectionException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (QueryException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (SiteException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (TrackerException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UserException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UtilException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (Exception $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
}

