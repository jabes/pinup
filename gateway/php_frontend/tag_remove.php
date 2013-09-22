<?php

$user = new User($HUB_USER_TPID);
$arrUser = $user->retrieveData(); // query user data
$user->authenticate(); // kick out bad sessions

function remove_tag($nTagID) {
	
	global $user;
	global $arrSiteData;

	// make sure the user is who he claims to be
	// only a site owner or tag creator can make this query
	if ($user->isUserSiteOwner($arrSiteData['id']) || $user->isUserTagOwner($nTagID)) {

		if (!Query::remove("tags", array('id' => $nTagID))) throw new QueryException("Failed to remove tag");
		if (ALLOW_MEMCACHE) {
			// I could join this with the first query to avoid making unnecessary calls to the db
			// But since memcache will probably stay off indefinitely.. screw it
			global $urldata;
			if (!isset($urldata['nRegimageID'])) throw new Exception("Insufficient credentials to perform this action");
			$strHash = o(new Query('select'))->run("SELECT ri.strHash FROM regimage AS ri WHERE id=" . $urldata['nRegimageID'] . "'");
			if (!$strHash) throw new QueryException("Failed to retrieve memkey");
			o(new Cache)->remove("getTags.single_{$strHash}");
		}

	} else throw new Exception("You have insufficient privileges to remove this tag");

}

if (isset($urldata['tagGUID'])) {

	$tagData = o(new Query('select'))->run("SELECT tags.id, tags.nRegimageID FROM tags WHERE strGUID='" . $urldata['tagGUID'] . "'");
	if (!$tagData) throw new Exception("Unable to find the requested tag given the provided credentials");
	remove_tag($tagData['id']);

} else if (isset($urldata['tagMultiGUID'])) {
	
	$multiTagData = o(new Query('selectMulti'))->sql("SELECT tags.id, tags.nRegimageID FROM tags WHERE strGUID IN ('%s')", implode("','", explode("_", $urldata['tagMultiGUID'])))->run();
	if (!$multiTagData) throw new Exception("Unable to find the requested tags given the provided credentials");
	foreach ($multiTagData as $tagData) remove_tag($tagData['id']);

}

Util::quit(null);
