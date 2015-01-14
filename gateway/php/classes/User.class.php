<?php

/***

@Date: 7/16/2011
@Author: Justin Bull
@Description: This class manages all methods related to user data
@Dependencies:
	- /php/classes/Query.class.php
	- /php/classes/Util.class.php

***/

class User
{

	const hashMethod = "sha512";

	private $sessid;
	private $user;
	private $siteOwner;
	private $tagOwner;
	private $blocked;
	private $output;



	public function __construct($sessid = null) {
		if ($sessid) $this->sessid = $sessid;
	}
	
	public static function hashPassword($password, $salt) {
		$hash = hash(User::hashMethod, $salt . $password);
		// hash the password multiple times
		for ($i=0; $i<1000; $i+=1) {
			$hash = hash(User::hashMethod, $salt . $hash);
		}
		return $hash;
	}

	public static function setPassword($userId, $newPass) {
		if (!$userId) throw new UserException('User identification required');
		else if (!$newPass) $newPass = Util::genRandomString(8);
		$salt = Util::genRandomString(8);
		return Query::update("accounts", array(
			'strPassword512' => User::hashPassword($newPass, $salt),
			'strSalt' => $salt
		), array('id' => $userId));
	}

	public static function register($strName, $strEmail, $strPassword, $strPassConfirm, $ipAddr) {
			
		$sqlSelect = new Query('select');

		if (empty($strName) || empty($strEmail) || empty($strPassword) || empty($strPassConfirm) || empty($ipAddr)) $err = "INSUFFICIENT DATA";
		else if (!Util::validEmail($strEmail)) $err = "EMAIL ADDRESS IS NOT VALID";
		else if (!filter_var($ipAddr, FILTER_VALIDATE_IP)) $err = "IP ADDRESS IS NOT VALID";
		else if ($strPassword != $strPassConfirm) $err = "YOUR PASSWORD CONFIRMATION DID NOT MATCH";
		else if ($sqlSelect->run("SELECT id FROM accounts WHERE strEmail='{$strEmail}'")) $err = "EMAIL/USERNAME ALREADY EXISTS";
		// else {
		// 	$blocked = $sqlSelect->run("
		// 		SELECT * FROM blockedregistrations 
		// 		WHERE strEmail='{$strEmail}' 
		// 		OR strIpAddress='{$ipAddr}'
		// 	");
		// 	if (!$blocked) {
		// 		$xml_string = Util::fileGetContents("http://www.stopforumspam.com/api", array('ip' => $ipAddr, 'email' => $strEmail));
		// 		if ($xml_string) $xml = new SimpleXMLElement($xml_string);
		// 		if (!$xml) $err = "SPAM CHECK FAILED";
		// 		else foreach ($xml->appears as $appears) if ($appears == "yes") {
		// 			$blocked = true;
		// 			Query::insert("blockedregistrations", array(
		// 				'strEmail' => $strEmail,
		// 				'strIpAddress' => $ipAddr
		// 			));
		// 		}
		// 	}
		// 	if ($blocked) $err = "YOUR EMAIL OR IP IS BLOCKED";
		// }
		
		if (isset($err)) return $err;

		// CREDENTIALS MET ~~~ CONTINUE
		
		$salt = Util::genRandomString(8);
		
		return Query::insert("accounts", array(
			'strFullName' => $strName,
			'strEmail' => $strEmail,
			'strGUID' => Query::sqlfn_uuid,
			'strPassword512' => User::hashPassword($strPassword, $salt),
			'strSalt' => $salt,
			'dateRegistered' => Query::sqlfn_now,
		));

	}

	// query our user data if needed
	public function retrieveData() {
		if (!$this->sessid) {
			throw new UserException('User session does not exist');
		}
		if (!$this->user) { // dont query user info if we already have it
			$query = new Query('select');
			$this->user = $query->run("SELECT * FROM accounts WHERE strTPID = '{$this->sessid}'");
		}
		return $this->user;
	}

	public function updateSession() {
		if ($this->user) { // if logged in
			session_regenerate_id(true); // replace current session id and delete old session
			$this->sessid = session_id();
			$_SESSION[SESSKEY_USER_TEMPID] = $this->sessid;
			Query::update("accounts", array(
				'strTPID' => $this->sessid, 
				'nFailedLoginAttempts' => 0
			), array(
				'id' => $this->user['id']
			));
			return $this->sessid;
		}
		return null;
	}
	
	public function login($strEmail, $strPassword) {
		if (!$this->user) { // if not logged in
			Query::update("accounts", array('dateLastLoginAttempt' => Query::sqlfn_now), array('strEmail' => $strEmail));
			$sqlSelect = new Query('select');
			$salt = $sqlSelect->run("SELECT strSalt FROM accounts WHERE strEmail = '{$strEmail}'");
			if ($salt) {
				$pass = User::hashPassword($strPassword, $salt);
				$this->user = $sqlSelect->run("
					SELECT id, strGUID, strFullName
					FROM accounts
					WHERE strEmail = '{$strEmail}' 
					AND strPassword512 = '{$pass}'
					AND bStatus=1
					AND bEmailVerified=1
				");
			}
		}
		return $this->user;
	}
	
	// check to see if the user has made too many login attempts
	public function tooManyLoginAttempts($strUsername) {
		
		$nMaxAttempt = 5; // max number of login attempts before kick
		$nKickTime = 1; // kick time in minutes
		
		// if user has made x bad login attempts then block user from login access for x minutes
		$query = new Query('select');
		return $query->run("
			SELECT TIMESTAMPDIFF(SECOND, DATE_ADD(NOW(), INTERVAL -{$nKickTime} MINUTE), dateLastLoginAttempt) AS nWaitTime
			FROM accounts 
			WHERE strEmail='{$strUsername}'
			AND nFailedLoginAttempts >= {$nMaxAttempt}
			AND dateLastLoginAttempt >= DATE_ADD(NOW(), INTERVAL -{$nKickTime} MINUTE)
		");
	}
	
	// rudimentary check to see if session is valid
	public function authenticate() {
		
		if (!$this->sessid) {
	
			throw new UserException('User session does not exist');

		} else if (!$this->user) {
			
			$this->user = $this->retrieveData();
			if (!$this->user) throw new UserException('User not found');

		} else if ($this->sessid != $this->user['strTPID']) {
			// kill session
			$this->terminate();
			throw new UserException('User session is not valid and was terminated');
		}

	}

	public function terminate()
	{
		if ($this->sessid) Query::update("accounts", array('strTPID' => null), array('strTPID' => $this->sessid));
		unset($_SESSION[SESSKEY_USER_TEMPID]);
		unset($this->sessid);
	}
	
	// check to see if our user is a site owner
	public function isUserSiteOwner($siteid) {
		if (!$this->user) throw new UserException('User not found');
		if (!$this->siteOwner) {
			$query = new Query('select');
			$this->siteOwner = $query->run("
				SELECT AccS.nSitesID FROM accounts Acc
				LEFT JOIN accountssites AccS ON AccS.nAccountsID = Acc.id
				WHERE Acc.id = {$this->user['id']}
				AND AccS.nSitesID = {$siteid}
				AND AccS.bVerified = 1
			") ? true : false;
		}
		return $this->siteOwner;
	}

	public function isUserTagOwner($tagid) {
		if (!$this->user) throw new UserException('User not found');
		if (!$this->tagOwner) {
			$query = new Query('select');
			$this->tagOwner = $query->run("
				SELECT * FROM tags 
				WHERE id = {$tagid}
				AND nTaggerAccountsID = {$this->user['id']}
			") ? true : false;
		}
		return $this->tagOwner;
	}

	public function getUserInfo($siteid) {
		if (!$this->user) throw new UserException('User not found');		
		if (!$this->output) {
			$out = array();
			$query = new Query('select');
			$out['guid'] = $this->user['strGUID'];
			$out['tagTotal'] = intval($query->run("SELECT COUNT(*) FROM tags WHERE nTaggerAccountsID = {$this->user['id']}"));
			$out['fullName'] = $this->user['strFullName'];
			if ($siteid) {
				$out['isOwner'] = $this->isUserSiteOwner($siteid);
			}
			$this->output = $out;
		}
		return $this->output;
	}

	/*
	@param {string} $agent The http user agent retrieved from the server
	@return {integer} The last inserted id into the useragents table
	*/
	public static function insertAgent($agent) 
	{
		if (empty($agent)) throw new UserException('User agent does not exist');
		return Query::insert("useragents", array(
			'strUserAgent' => $agent,
			'strAgentHash' => md5($agent)
		));
	}

}

class UserException extends Exception {}