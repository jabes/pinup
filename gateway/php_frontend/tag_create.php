<?php

$user = new User($HUB_USER_TPID);
$arrUser = $user->retrieveData(); // query user data
$user->authenticate(); // kick out bad sessions

// TAGGER NEEDS TO BE SITE OWNER
$isUserSiteOwner = $user->isUserSiteOwner($arrSiteData['id']);
if (!$isUserSiteOwner) throw new UserException('This account does not have permission to perform this action');

$tagData = array();
foreach ($HUB_REQUIRED_PARAMS as $k) $tagData[$k] = strip_tags($urldata[$k]);

$queryHandle = new Query('select');
$queryString = "SELECT COUNT(*) FROM tags WHERE strIpAddress = '%s' AND strTimestamp >= DATE_ADD(now(), INTERVAL -1 %s)";

// DO SOME VALIDATIONS
if (!Util::remoteFileExists($tagData['strWebLink'])) Util::quit("LINK TO WEBSITE IS NOT VALID");
elseif ($queryHandle->sql($queryString, $HUB_USER_IP, "MINUTE")->run() > 10) Util::quit("TOO MANY TAGS IN 1 MINUTE");
elseif ($queryHandle->sql($queryString, $HUB_USER_IP, "HOUR")->run() > 100) Util::quit("TOO MANY TAGS IN 1 HOUR");
elseif ($queryHandle->sql($queryString, $HUB_USER_IP, "DAY")->run() > 500) Util::quit("TOO MANY TAGS IN 1 DAY");


// MANAGE KEYWORDS
$arrKeywords = preg_split("/[\s]*[,][\s]*/", $tagData['strKeywords']);
$arrKeywordMap = array();
if (count($arrKeywords) > 0) {
	foreach($arrKeywords as $keyword) {
		if (strlen($keyword) > 0) { // dont allow empty strings
			$kid = Query::insert("keywords", array(
				'strKeyword' => $keyword
			));
			if (isset($kid) && $kid > 0) $arrKeywordMap[] = $kid;
		}
	}
}

$strImageHash = md5_file($tagData['strImageURL']);
if (!Query::insert("tags", array(
	'strTagName' => $tagData['strTagName'],
	'strWebLink' => $tagData['strWebLink'],
	'strWebReferer' => $tagData['strWebReferer'],
	'strKeywordsMap' => implode(DB_ARRAY_DELIMITER, $arrKeywordMap),
	'nPosX' => $tagData['nPosX'],
	'nPosY' => $tagData['nPosY'],
	'nRegimageID' => sprintf("(SELECT ri.id FROM regimage AS ri WHERE ri.strHash = '%s' AND nSitesID = %s)", $strImageHash, $arrSiteData['id']),
	'nSitesID' => $arrSiteData['id'],
	'nTaggerAccountsID' => $arrUser['id'],
	'strGUID' => Query::sqlfn_uuid,
	'strIpAddress' => $HUB_USER_IP,
	'nUserAgentsID' => User::insertAgent($HUB_USER_AGENT)
))) throw new QueryException("Failed to insert tag record for an unknown reason");


if (ALLOW_MEMCACHE) {
	$cache = new Cache;
	$cache->remove("getTags.single_{$strImageHash}");
}


Util::quit(null);