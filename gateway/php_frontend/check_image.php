<?php

// get the unique value for the new image: 
$strImageHash = md5_file($urldata['strImageURL']);
if (!$strImageHash) throw Exception("Failed to hash regimage file");



// if we don't have a record already, we need to create one. so we have an id for this image in the future.
// note: this query may return multiple results due to the site alias. make sure to limit the result
$query = new Query('select');
$regimage = $query->run("
	SELECT ri.id, ri.strImagePath
	FROM regimage AS ri
	LEFT JOIN sitesalias AS sa ON sa.nSitesID = ri.nSitesID
	WHERE ri.strHash = '{$strImageHash}'
	AND (ri.nSitesID = {$arrSiteData['id']} OR sa.nAliasSitesID = {$arrSiteData['id']})
	LIMIT 0,1
");


// the provided image path is not the same as the record found by hash comparison so return the record path (was highjacked)
if ($regimage) {

	
	// track every time an image gets approved
	Tracker::trackImage($HUB_USER_IP, $arrSiteData['id'], $regimage['id']);

	if ($regimage['strImagePath'] !== $urldata['strImageURL']) {
		
		// ok ok hold on a sec.. the image hashes match but the paths do not?
		// before we override the original path with our regimage path, check and make sure it still exists..
		// YES it is possible the path was recorded in the past but has since been deleted.
		if (Util::remoteFileExists($regimage['strImagePath'])) {

			// GREAT, the path still exists. Now send it back.
			Util::quit($regimage['strImagePath']);
		
		} else {

			// Hmm.. seems the path no longer exists.
			// In that case, override the regimage path and keep the original.
			// We do this so that all the old tag data will be transferred to our new path.
			// How does that work? Tag data is associated with the regimage field `id` NOT `strImagePath`.
			Query::update("regimage", array('strImagePath' => $urldata['strImageURL']), array('id' => $regimage['id']));
			
			// DONE, no need to pass back the original image path.

		}

	}

} else {
	
	// nothing was found so make a new record
	$lastInsertID = Query::insert("regimage", array(
		'nSitesID' => $arrSiteData['id'],
		'strImagePath' => $urldata['strImageURL'],
		'strHash' => $strImageHash,
		'dateCreated' => Query::sqlfn_now,
	));
	
	// track every time an image gets the logo 
	Tracker::trackImage($HUB_USER_IP, $arrSiteData['id'], $lastInsertID);

}





Util::quit(null);

