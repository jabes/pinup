<?php

// disable deprecated warnings
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE | E_STRICT);

require_once dirname(__FILE__) . "/php/config.php";

function classLoader($classname) {
	if (!include(sprintf(CLASS_FILE_LOCATION, $classname))) if (DEVMODE) echo "Unable to load class '{$classname}'" . PHP_EOL;
}
spl_autoload_register("classLoader");


// identity function, returns its argument unmodified.
function o($o) { return $o; }

$HUB_USER_TPID = isset($_SESSION['USER_SESSION_AGENT']) ? $_SESSION['USER_SESSION_AGENT'] : null;
$HUB_USER_IP = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
$HUB_USER_AGENT = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;
$HUB_REFERER = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;


try {

	$connSlave = new Connection(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB);
	$urldata = Connection::cleanData($_REQUEST);

	if ($HUB_USER_TPID) {
		$user = new User($HUB_USER_TPID);
		$arrUser = $user->retrieveData(); // query user data
	}

	$arrTagInfo = o(new Query)->select("SELECT id, strWebLink, nSitesID FROM tags WHERE tags.strGUID = '" . $urldata['u'] . "'");
	if (!$arrTagInfo) Util::quit("Not a valid url, please reload the image and try again");

	
	
	// analyse the destination url and format it in a way that is query friendly
	$pwl = Util::parseUrl($arrTagInfo['strWebLink']);
	if (!empty($pwl['domain']) && !empty($pwl['extension'])) {
		$scheme = !empty($pwl['scheme']) ? $pwl['scheme'] : "http";
		$subdomain = !empty($pwl['subdomain']) ? $pwl['subdomain'] : "www";
		$urlDestination = $scheme . "://" . $subdomain . "." . $pwl['domain'] . $pwl['extension'];
	}
	
	// if we succeeded in building the query friendly url, then execute the query
	if (isset($urlDestination)) {
		// if the destination url exists in the sites table, try and find the account it belongs to
		$nSiteClickedToID = o(new Query)->select("SELECT id FROM sites WHERE strURL = '{$urlDestination}'");
	}
	


	Query::insert("clicklog", array(
		'nTagClickedID' => $arrTagInfo['id'],
		'strWebLink' => $arrTagInfo['strWebLink'],
		'strWebReferer' => $HUB_REFERER,
		'strClickerIP' => $HUB_USER_IP,
		'nUserAgentsID' => User::insertAgent($HUB_USER_AGENT),
		'nAccountsID' => $arrUser['id'],
		'nSiteClickedFromID' => $arrTagInfo['nSitesID'],
		'nSiteClickedToID' => $nSiteClickedToID
	));



} catch (CacheException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (ConnectionException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (QueryException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (SiteException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (TrackerException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UserException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (UtilException $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
} catch (Exception $e) {
	if (DEVMODE) print_r($e); else echo $e->getMessage();
}


if (substr($arrTagInfo['strWebLink'], 0, 4) !== "http") $arrTagInfo['strWebLink'] = "http://" . $arrTagInfo['strWebLink'];

?>
<!DOCTYPE html>
<html>
<head><title>Redirecting...</title><meta http-equiv="refresh" content="0;url=<?=$arrTagInfo['strWebLink']?>"></head>
<body></body>
</html>