<?php

header("content-type: text/css");

require_once dirname(__FILE__) . "/../../gateway/php/config.php";
require_once dirname(__FILE__) . "/../../gateway/php/classes/Util.class.php";
require_once dirname(__FILE__) . "/includes/class.CodeBuilder.php";
require_once dirname(__FILE__) . "/includes/CssParser.php";

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(10);


$theme = isset($_GET['theme']) ? $_GET['theme'] : "default";
$compress = isset($_GET['compress']) ? $_GET['compress'] : null;
$compress = ("true" === $compress) ? true : false;


$ocss = new CodeBuilder($compress, $theme);
echo $ocss->output();

