<?php

// disable deprecated warnings
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE | E_STRICT);

require_once dirname(__FILE__) . "/config.php";

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

$HUB_USER_TPID = isset($_SESSION[SESSKEY_USER_TEMPID]) ? $_SESSION[SESSKEY_USER_TEMPID] : null;
$HUB_USER_IP = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
$HUB_USER_AGENT = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;
$HUB_REFERER = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;
