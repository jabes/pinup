<?php

$arrSettingTypes = array(
	'nMinWidth' => 'integer',
	'nMinHeight' => 'integer',
	'jsonpTimeout' => 'integer', 
	'scrollDelay' => 'integer', 
	'navAniSpeed' => 'integer', 
	'loadAll' => 'boolean',
	'smartLoad' => 'boolean', 
	'forceListen' => 'boolean', 
	'alwaysShowTags' => 'boolean',
	'cssHelper' => 'boolean',
	'posHelper' => 'boolean', 
	'animations' => 'boolean', 
	'keyListener' => 'boolean',
	'themeFile' => 'string', 
	'allowFile' => 'string', 
	'allowThemeManager' => 'boolean',
	'allowLocalStorage' => 'boolean', 
	'allowBottomLinks' => 'boolean', 
	'allowShare' => 'boolean', 
	'dotSize' => 'string', 
	'dotOutlineSize' => 'integer',
	'canvas' => 'array',
	'canvas.cornerRadius' => 'integer',
	'canvas.tailWidth' => 'integer',
	'canvas.tailHeight' => 'integer', 
	'canvas.stroke' => 'boolean', 
	'canvas.shadow' => 'boolean', 
	'canvas.theme' => 'array',
	'canvas.theme.backgroundStyle' => 'string', 
	'canvas.theme.backgroundColor' => 'string', 
	'canvas.theme.strokeWidth' => 'integer', 
	'canvas.theme.strokeColor' => 'string',
	'canvas.theme.shadowOffsetX' => 'integer',
	'canvas.theme.shadowOffsetY' => 'integer',
	'canvas.theme.shadowBlur' => 'integer',
	'canvas.theme.shadowColor' => 'string',
	'tooltip' => 'boolean', 
	'tooltipOrientation' => 'string', 
	'tooltipURL' => 'boolean', 
	'altImageSrc' => 'string', 
	'activeParentClass' => 'string',
	'activeChildClass' => 'string', 
	'custom' => 'array'
);

foreach (array_keys($arrSettingTypes) as $key => $val) $arrFieldNames[$key] = "ss." . array_shift(explode(".", $val));
$arrFieldNames = array_unique($arrFieldNames);


function checkTypeCast($array, $scope = "") {
	global $arrSettingTypes;
	// all query values will be string types so lets do some type casting
	foreach ($array as $key => $value) 
	{
		$newscope = ltrim($scope . "." . $key, ".");
		if ($arrSettingTypes[$newscope] === 'boolean') $array[$key] = ($value === "1" || $value === "true") ? true : false;
		elseif ($arrSettingTypes[$newscope] === 'integer') $array[$key] = intval($value);
		elseif ($arrSettingTypes[$newscope] === 'array') {
			if (is_string($value)) $value = json_decode($value);
			if (empty($value)) unset($array[$key]); else $array[$key] = checkTypeCast($value, $newscope);
		}
	}
	return $array;
}


$arrSiteSettings = o(new Query)->sql("SELECT %s FROM sitessettings AS ss WHERE nSitesID = %s", implode(Query::sql_delimiter, $arrFieldNames), $arrSiteData['id'])->select();


// frontend is expecting an array, empty or not
Util::quit(!$arrSiteSettings ? array() : checkTypeCast($arrSiteSettings));


