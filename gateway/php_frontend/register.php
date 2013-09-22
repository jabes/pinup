<?php


$userid = User::register($urldata['strFullName'], $urldata['strUsername'], $urldata['strPassword'], $urldata['strConfirmPass'], $HUB_USER_IP);
if (is_string($userid)) Util::quit($userid);

$accInfo = o(new Query('select'))->run("
	SELECT 
		acc.strFullName, 
		acc.strEmail, 
		acc.strGUID
	FROM accounts AS acc
	WHERE id={$userid}
");
if (!$accInfo) throw new QueryException('Failed to retrieve account information');

$siteid = Site::register($urldata['strWebURL'], $urldata['strWebName'], $userid);
if (is_string($siteid)) {
	if (!Query::remove("accounts", array(
		'id' => $userid
	))) throw new QueryException('Failed to remove invalid account');
	Util::quit($siteid);
}

$siteInfo = o(new Query('select'))->run("
	SELECT 
		site.strSiteName, 
		site.strURL, 
		site.strGUID
	FROM sites AS site
	WHERE id={$siteid}
");
if (!$siteInfo) throw new QueryException('Failed to retrieve site information');


function simple_uid($uid) {
	return str_replace("-", "", $uid);
}

$message = sprintf("Hello %s,

Thank you for checking us out! A couple things need to happen before you can start tagging. In no particular order, we need to verify your account and the website associated with the account. Simply follow the instructions below.

To activate your account, please click the link below.

%s/userauth/%s

To activate your website (%s), please paste the following code into the document head of your default page. In most cases, index.html will be the default page.

<meta name=\"%s\" content=\"%s\" />

Go to %s and make sure the above code is in the document head. If so, click the link below to activate the site.

%s/siteauth/%s

One last thing! Paste the following code in your document head.

<script type=\"text/javascript\">Pinup(\"%s\");</script>

At this point, feel free to remove the meta tag, as it is no longer needed. Congrats! Assuming all went well, you can now start tagging your pictures!

%s Team
%s
", $accInfo['strFullName'], SYS_WEBURL, simple_uid($accInfo['strGUID']), $siteInfo['strSiteName'], SITE_VERIFY_METAKEY, $siteInfo['strGUID'], $siteInfo['strURL'], SYS_WEBURL, simple_uid($siteInfo['strGUID']), $siteInfo['strGUID'], SYS_NAME, MAINSITE_URL);

Util::plainMail($accInfo['strEmail'], "Account Verification", $message);
Util::quit(null);
