<?php

function insert_log($strTagGuid) {
	global $HUB_USER_IP;
	global $HUB_USER_AGENT;
	if (!Query::insert("tagslog", array(
		'nTagsID' => o(new Query)->select("SELECT id FROM tags WHERE strGUID='{$strTagGuid}'"),
		'strClickerIP' => $HUB_USER_IP,
		'nUserAgentsID' => User::insertAgent($HUB_USER_AGENT)
	))) throw new QueryException("Failed to insert log");
}

if (isset($urldata['tagGUID'])) {
	insert_log($urldata['tagGUID']);
} else if (isset($urldata['tagMultiGUID'])) {
	foreach (explode("_", $urldata['tagMultiGUID']) as $guid) insert_log($guid);
}


Util::quit(null);
