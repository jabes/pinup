<?php

/*

If a string is passed in then we get tags for one image.
If an array is passed in then we get tags for multiple images.

EXPECTED DATA STRUCTURES:

$urldata->strImageURL
--------------------------------------------------
Array(
	[md5(nPosX/nPosY)] => Array(
		[0] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		),
		[1] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		)
	),
	[md5(nPosX/nPosY)] => Array(
		[0] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		),
		[1] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		)
	)
)

$urldata->arrImageURL
--------------------------------------------------
Array(
	["http://www.somesite.com/image.jpg"] => Array(		
		[0] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		),
		[1] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		)
	),
	["http://www.somesite.com/image.jpg"] => Array(		
		[0] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		),
		[1] => Array(
			"strGUID" => "def81466-04df-11e1-b416-72938c046e1b"
			"strTagName" => "Starbucks Coffee"
			"nPosX" => "0.5325000000"
			"nPosY" => "0.4325000000"
			"strKeywords" => "starbucks, coffee, christmas, blend"
			"strWebLink" => "http://www.starbucks.com/"
			"nTaggerAccountsID" => "17"
		)
	)
)

*/


function get_keywords_from_map($map) {
	$arr = array();
	# do not rely on 'Query::sql_delimiter' having the same value as 'DB_ARRAY_DELIMITER'
	$list = implode(Query::sql_delimiter, explode(DB_ARRAY_DELIMITER, $map));
	if ($list) {
		$arr = o(new Query("selectMulti"))->sql("
			SELECT kw.strKeyword
			FROM keywords AS kw
			WHERE kw.id IN ({$list})
			ORDER BY kw.strKeyword ASC
		")->run();
	}
	return $arr;
}

if (isset($urldata['strImageURL'])) {
	
	# will return false on failure
	if ($strImageHash = @md5_file($urldata['strImageURL'])) {

		$arrTags = o(new Query)->sql("
			SELECT
				tags.strGUID, 
				tags.strTagName, 
				tags.nPosX, 
				tags.nPosY, 
				tags.strKeywordsMap, 
				tags.strWebLink,
				tags.nTaggerAccountsID
			FROM tags
			LEFT JOIN regimage AS ri ON ri.id = tags.nRegimageID
			LEFT JOIN sitesalias AS sa ON sa.nSitesID = ri.nSitesID
			WHERE ri.strHash = '{$strImageHash}'
			AND (tags.nSitesID=" . $arrSiteData['id'] . " OR sa.nAliasSitesID=" . $arrSiteData['id'] . ")
			AND tags.bApproved=1
			AND tags.bDeleted=0
			ORDER BY tags.dateCreated DESC
		")->cache("getTags.single_{$strImageHash}", "1week")->selectMulti();
		
	} else throw new Exception("Failed to create hash of image file stream");
	
	if (!$arrTags) {
		
		# keep track every time an image trys to load tags that do not exist (the image does not have tags.. yet)
		Tracker::trackNoTags($HUB_USER_IP, $arrSiteData['id']);

	} else {
		
		# keep track every time an image loads tags
		Tracker::trackGotTags($HUB_USER_IP, $arrSiteData['id']);
		
		# format the array to reflect the desired output
		$arrFormatted = array();
		foreach($arrTags as $tagData) {
			# create hash of the tag position that we will use as an index for our sub arrays
			$key = md5($tagData['nPosX'] . '/' . $tagData['nPosY']);
			# insert sub array if our key does not exist
			if (!array_key_exists($key, $arrFormatted)) $arrFormatted[$key] = array();
			# insert some tag data into our sub array
			# only allow 3 tags ber bubble
			if (count($arrFormatted[$key]) < 3) {
				$tagData['arrKeywords'] = get_keywords_from_map($tagData['strKeywordsMap']);
				# do not pass sensitive info to the frontend
				unset($tagData['strKeywordsMap']);
				$arrFormatted[$key][] = $tagData;
			}
		}

		Util::quit($arrFormatted);
		
	}
	

} else if (isset($urldata['arrImageURL'])) { // api
	
	$hashes = array();
	
	foreach (array_unique($urldata['arrImageURL']) as $strImageURL) {
		# will return false on failure
		if ($strImageHash = @md5_file($strImageURL)) $hashes[] = $strImageHash;
		else throw new Exception("Failed to create hash of image file stream");
	}

	if (!empty($hashes)) {
		
		$arrImages = o(new Query)->sql("
			SELECT
				ri.strImagePath,
				tags.strGUID, 
				tags.strTagName, 
				tags.nPosX, 
				tags.nPosY, 
				tags.strKeywordsMap, 
				tags.strWebLink,
				tags.nTaggerAccountsID
			FROM tags
			LEFT JOIN regimage AS ri ON ri.id = tags.nRegimageID
			LEFT JOIN sitesalias AS sa ON sa.nSitesID = ri.nSitesID
			WHERE ri.strHash IN ('" . implode("','", $hashes) . "') 
			AND (tags.nSitesID=" . $arrSiteData['id'] . " OR sa.nAliasSitesID=" . $arrSiteData['id'] . ")
			AND bApproved=1
			AND bDeleted=0
			ORDER BY tags.dateCreated DESC
		")->cache("getTags.multiple_" . md5(serialize($hashes)), "1week")->selectMulti("strImagePath");

		
		foreach($arrImages as $imageKey => $arrTags) {
			foreach($arrTags as $tagKey => $arrTag) {
				$arrImages[$imageKey][$tagKey]['arrKeywords'] = get_keywords_from_map($arrTag['strKeywordsMap']);
				# do not pass sensitive info to the frontend
				unset($arrImages[$imageKey][$tagKey]['strKeywordsMap']);
			}
		}

		Util::quit($arrImages);

	}


}


// no image provided // return nothing
Util::quit(null);
