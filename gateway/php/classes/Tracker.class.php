<?php

/***

@Date: 9/7/2011
@Author: Justin Bull
@Description: This class manages all methods related to tracking public accesses
@Dependencies:
	- /php/classes/Query.class.php

***/

class Tracker
{

	# track every time an activated image initializes
	public static function trackImage($ipaddy, $nSiteID, $nRegimageID) {
		if (!isset($ipaddy) || !isset($nSiteID)) {
			throw new TrackerException('Insufficient data for access tracker to function');
		} else {
			// only allow one log per image, per ip, per day
			// SELECT * FROM accesstracker WHERE strIpAddress='{$ipaddy}' AND nRegimageID={$nRegimageID} AND DATE(dateCreated)=CURDATE()
			// note: just log everything; we can check ip addresses when we need to.. chances are that html5 local storage will prevent them from loading this twice anyhow
			Query::insert("accesstracker", array(
				'nAccessType' => 1,
				'nSitesID' => $nSiteID,
				'strIpAddress' => $ipaddy,
				'nRegimageID' => $nRegimageID,
				'dateCreated' => Query::sqlfn_now,
			));
		}
	}
	
	# track every time an activated image trys to load tags that don't exist
	public static function trackNoTags($ipaddy, $nSiteID) {
		if (!isset($ipaddy) || !isset($nSiteID)) {
			throw new TrackerException('Insufficient data for access tracker to function');
		} else {
			
			Query::insert("accesstracker", array(
				'nAccessType' => 2,
				'nSitesID' => $nSiteID,
				'strIpAddress' => $ipaddy,
				'dateCreated' => Query::sqlfn_now,
			));
		}
	}

	# track every time an activated image loads tags
	public static function trackGotTags($ipaddy, $nSiteID) {
		if (!isset($ipaddy) || !isset($nSiteID)) {
			throw new TrackerException('Insufficient data for access tracker to function');
		} else {
			
			Query::insert("accesstracker", array(
				'nAccessType' => 3,
				'nSitesID' => $nSiteID,
				'strIpAddress' => $ipaddy,
				'dateCreated' => Query::sqlfn_now,
			));

		}
	}


}

class TrackerException extends Exception {}