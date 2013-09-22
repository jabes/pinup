<?php

function convert_uuid($s) {
	if (strlen($s) != 32) throw new Exception("User account number is malformed");
	return sprintf("%s-%s-%s-%s-%s",
		substr($s, $i = 0, $n = 8), 
		substr($s, $i += $n, $n = 4), 
		substr($s, $i += $n, $n = 4),
		substr($s, $i += $n, $n = 4),
		substr($s, $i += $n, $n = 12)
	);
}

$uuid = convert_uuid($urldata['uuid']);
if (!$uuid) throw new Exception("An unexpected error occurred while processing the user account number");

$accInfo = o(new Query('select'))->run("
	SELECT acc.id, acc.bEmailVerified
	FROM accounts AS acc
	WHERE strGUID='{$uuid}'
");

if (!$accInfo) throw new Exception("User account not found");
else if ($accInfo['bEmailVerified'] == 1) throw new Exception("Account is already authenticated, no action taken");
else if (!Query::update("accounts", array(
	'bEmailVerified' => true
), array(
	'id' => $accInfo['id']
))) throw new QueryException("Failed to update account record for an unknown reason");

Util::quit("Account was successfully authenticated");

