<?php

function convert_uuid($s) {
	if (strlen($s) != 32) throw new Exception("Site account number is malformed");
	return sprintf("%s-%s-%s-%s-%s",
		substr($s, $i = 0, $n = 8), 
		substr($s, $i += $n, $n = 4), 
		substr($s, $i += $n, $n = 4),
		substr($s, $i += $n, $n = 4),
		substr($s, $i += $n, $n = 12)
	);
}

$uuid = convert_uuid($urldata['uuid']);
if (!$uuid) throw new Exception("An unexpected error occurred while processing the site account number");

$siteInfo = o(new Query('select'))->run("
	SELECT 
		site.id, 
		site.bVerified, 
		site.strURL, 
		site.strGUID
	FROM sites AS site
	WHERE strGUID='{$uuid}'
");

if (!$siteInfo) throw new Exception("Site account not found");
else if ($siteInfo['bVerified'] == 1) throw new Exception("Site is already authenticated, no action taken");

$meta_tags = get_meta_tags($siteInfo['strURL']);

if (!$meta_tags || !array_key_exists(SITE_VERIFY_METAKEY, $meta_tags)) throw new Exception("Could not find verification meta tag");
else if ($meta_tags[SITE_VERIFY_METAKEY] != $siteInfo['strGUID']) throw new Exception("Incorrect verification meta tag");


if (!Query::update("sites", array(
	'bVerified' => true
), array(
	'id' => $siteInfo['id']
))) throw new QueryException("Failed to update site record for an unknown reason");

if (!Query::update("accountssites", array(
	'bVerified' => true
), array(
	'nSitesID' => $siteInfo['id']
))) throw new QueryException("Failed to update site<->account link record for an unknown reason");

Util::quit("Site was successfully authenticated");

