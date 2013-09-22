<?php

$user = new User($HUB_USER_TPID);
$arrUser = $user->retrieveData(); // query user data
$user->authenticate(); // kick out bad sessions

// TAGGER NEEDS TO BE SITE OWNER
$isUserSiteOwner = $user->isUserSiteOwner($arrSiteData['id']);
if (!$isUserSiteOwner) throw new UserException('This account does not have permission to perform this action');

$tagData = array();
foreach ($HUB_REQUIRED_PARAMS as $k) $tagData[$k] = strip_tags($urldata[$k]);

function reposition_tag($tagGUID) {
	global $tagData;
	Query::update("tags", array(
		'nPosX' => $tagData['nPosX'], 
		'nPosY' => $tagData['nPosY']
	), array('strGUID' => $tagGUID));
}

if (isset($tagData['tagGUID'])) {
	reposition_tag($tagData['tagGUID']);
} else if (isset($tagData['tagMultiGUID'])) {
	foreach (explode("_", $tagData['tagMultiGUID']) as $guid) reposition_tag($guid);
}

if (ALLOW_MEMCACHE) {
	$cache = new Cache;
	$strImageHash = md5_file($tagData['strImageURL']);
	$cache->remove("getTags.single_{$strImageHash}");
}

Util::quit(null);
