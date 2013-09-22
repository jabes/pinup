<?php

# In PHP 5.2 or higher we don't need to bring this in
if (!function_exists('json_encode') || !function_exists('json_decode')) {
	
	require_once dirname(__FILE__) . "/../pear/JSON.php";

	function json_encode($arg)
	{
		global $services_json;
		if (!isset($services_json)) {
			$services_json = new Services_JSON();
		}
		return $services_json->encode($arg);
	}

	function json_decode($arg)
	{
		global $services_json;
		if (!isset($services_json)) {
			$services_json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
		}
		return $services_json->decode($arg);
	}

} 

