<?php


// trying to get user data with no session will throw an error
if (isset($HUB_USER_TPID)) {
	$user = new User($HUB_USER_TPID);
	if ($user && $user->retrieveData()) {
		Util::quit($user->getUserInfo($arrSiteData['id']));
	}
}

// user was not logged in
Util::quit(null);
