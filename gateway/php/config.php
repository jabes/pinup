<?php

$host = $_SERVER['HTTP_HOST'];
$doc_root = $_SERVER['DOCUMENT_ROOT'];

define('SYS_VERSION', "2.02"); # same as JS script version on CDN
define('SYS_NAME', "Pinup");
define('SYS_DOMAIN', $host); # reliant domain name used within system
define('SYS_MYSQL_PORT', 3306);
define('SYS_WEBURL', "http://" . SYS_DOMAIN . "/gateway"); # reliant web url (backend: used in system connections)
define('SYS_AGENT', SYS_NAME . "/Hub/v-" . SYS_VERSION);
define('SYS_POSTMASTER_EMAIL', "bull.justin@gmail.com");

define("DOCUMENT_ROOT", "{$doc_root}/gateway");
define("HUB_FILE_LOCATION", DOCUMENT_ROOT . "/php_frontend/%s.php");
define("CLASS_FILE_LOCATION", DOCUMENT_ROOT . "/php/classes/%s.class.php");

define("DEVMODE", false); # warning: if true, frontend will stop working
define("ALLOW_MEMCACHE", false);

define('MYSQL_HOST', "127.0.0.1");
define('MYSQL_USER', "root");
define('MYSQL_PASS', "root");
define('MYSQL_DB', "pinup");

define('MAINSITE_URL', "http://" . SYS_DOMAIN . "/"); # unreliant web url (frontend: used in contact info)
define('JSONP_RETURN_METHOD', SYS_NAME . ".jsonpHandler['%s'](%s);");
define('SITE_VERIFY_METAKEY', strtolower(SYS_NAME) . "-site-verification");

define('SESS_NAME', SYS_NAME . "_Hub_Session");
define('SESSKEY_USER_TEMPID', SYS_NAME . "_Session_User_TempId");
define('SESSKEY_USER_WASKICKED', SYS_NAME . "_Session_User_WasKicked");

# do not change this value post dev - values in the db will already have this delimiter saved
define('DB_ARRAY_DELIMITER', ","); # delimiter used when storing arrays as text in a database record

define('REQUIRED_PARAMS', serialize(array(
	'check_image' => array("strImageURL"),
	'check_login' => array(),
	'forgot_pass' => array("strUsername"),
	'get_site_settings' => array(),
	'get_tag_suggestion' => array("strChars"),
	'get_tags' => array("strImageURL/arrImageURL"),
	'log_tag_hover' => array("tagGUID/tagMultiGUID"),
	'login' => array("strUsername", "strPassword"),
	'logout' => array(),
	'register' => array("strFullName", "strUsername", "strPassword", "strConfirmPass", "strWebName", "strWebURL"),
	'tag_create' => array("strTagName", "strWebLink", "strImageURL", "strWebReferer", "nPosX", "nPosY", "strKeywords"),
	'tag_position' => array("tagGUID/tagMultiGUID", "strImageURL", "nPosX", "nPosY"),
	'tag_remove' => array("tagGUID/tagMultiGUID"), #nRegimageID?
	'verify_user' => array("uuid"),
	'verify_site' => array("uuid")
)));

define("VALID_DOMAIN_EXCEPTIONS", serialize(array(SYS_DOMAIN)));
