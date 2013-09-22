<?php

$accInfo = o(new Query)->sql("SELECT * FROM accounts WHERE strEmail = '%s'", $urldata['strUsername'])->select();
if (!$accInfo) Util::quit("THAT EMAIL WAS NOT FOUND.");

$newPassword = Util::genRandomString(8);
User::setPassword($accInfo['id'], $newPassword);

// try and kick out a previous login
$user = new User($HUB_USER_TPID);
$user->terminate();


$message = sprintf("Hello %s,

Someone (hopefully you) has requested for a password change.

A new password has been made for you: %s

For your protection, we recommend that you change it as soon as possible, and/or delete this email.

%s Team
%s
", $accInfo['strFullName'], $newPassword, SYS_NAME, MAINSITE_URL);

Util::plainMail($accInfo['strEmail'], "Password Recovery", $message);

Util::quit(null);

