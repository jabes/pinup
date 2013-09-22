<?php

$user = new User($HUB_USER_TPID); // pass in the old TPID so we can terminate the session

// prevent rainbow table attacks 
$nWaitTime = $user->tooManyLoginAttempts($urldata['strUsername']);

if (isset($nWaitTime)) {
	// use a session to remember if user has been kicked
	$_SESSION[SESSKEY_USER_WASKICKED] = true; 
	Util::quit("PLEASE TRY AGAIN IN {$nWaitTime} SECONDS");
}



// try login
$arrUser = $user->login($urldata['strUsername'], $urldata['strPassword']);
if (!$arrUser) {
	
	// if the user has just finished their sentence then reset back to 1
	// faster to do this than check how many current attempts have been made
	if (isset($_SESSION[SESSKEY_USER_WASKICKED])) {
		unset($_SESSION[SESSKEY_USER_WASKICKED]);
		Query::update("accounts", array('nFailedLoginAttempts' => 1), array('strEmail' => $urldata['strUsername']));
	} else {
		Query::execute("UPDATE accounts SET nFailedLoginAttempts = nFailedLoginAttempts + 1 WHERE strEmail = '%s'", $urldata['strUsername']);
	}
	
	$accInfo = o(new Query)->sql("
		SELECT 
			acc.bStatus,
			acc.bEmailVerified 
		FROM accounts AS acc 
		WHERE acc.strEmail = '%s'
	", $urldata['strUsername'])->select();
	
	if ($accInfo) {
		if ($accInfo['bStatus'] == 0) Util::quit("ACCOUNT DISABLED");	
		else if ($accInfo['bEmailVerified'] == 0) Util::quit("ACCOUNT NOT VERIFIED");	
		else Util::quit("INVALID USERNAME OR PASSWORD");
	} else Util::quit("ACCOUNT DOES NOT EXIST");

} else {


	// dont allow users to login if this is an admin-only site
	if (!$user->isUserSiteOwner($arrSiteData['id'])) Util::quit("YOU DO NOT HAVE SUFFICIENT PERMISSION");

	// try and kick out a previous login
	$user->terminate();

	// set a new TPID for this user and use it as their user session value
	// note: it is not necessary to set HUB_USER_TPID at this point, but what the hell
	$HUB_USER_TPID = $user->updateSession();
	$userInfo = $user->getUserInfo($arrSiteData['id']);
	
	

	Util::quit($userInfo);

}
