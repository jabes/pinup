<?php

/***

@Date: 11/23/2011
@Author: Justin Bull
@Description: This class manages all methods related to user data
@Dependencies:
	- curl extension [http://php.net/manual/en/book.curl.php]
	- /php/config.php

***/

class Util
{
	
	public static $CURL_OPTS = array(
		//CURLOPT_HTTPHEADER => array('Expect:'), // disable the 'Expect: 100-continue' behaviour.
		CURLOPT_CONNECTTIMEOUT => 10,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_POST => false,
		//CURLOPT_NOBODY => true,
		CURLOPT_PORT =>	SYS_HTTP_PORT,
		CURLOPT_SSL_VERIFYPEER => false
	);
	
	/*
	public static function getCurrentURI()
	{
		$protocol = (strstr($_SERVER["SERVER_PROTOCOL"], "https")) ? "https" : "http";
		$port = ($_SERVER['SERVER_PORT'] !== "80") ? ":{$_SERVER['SERVER_PORT']}" : "";
		return $protocol . "://" . $_SERVER['SERVER_NAME'] . $port . $_SERVER['REQUEST_URI'];
	}
	*/

	public static function strTimeDuration($strtime)
	{
		if (is_string($strtime)) return strtotime($strtime) - strtotime('NOW');
		return 0;
	}

	public static function quit($data)
	{
		global $HUB_RETURN_FORMAT;
		global $HUB_JSONP_ID;
		if (DEVMODE) {
			if (is_array($data)) print_r($data);
			else var_dump($data);
			exit;
		} elseif ($HUB_RETURN_FORMAT == "jsonp") {
			if (is_string($data)) $data = "'" . $data . "'";
			elseif (is_array($data)) $data = json_encode($data);
			exit(sprintf(JSONP_RETURN_METHOD, $HUB_JSONP_ID, $data));
		} elseif ($HUB_RETURN_FORMAT === "json") {
			if (is_array($data) && !empty($data)) echo json_encode($data);
			exit;
		} elseif ($HUB_RETURN_FORMAT === "text") {
			exit($data);
		} else throw new UtilException('Data return failed because some required parameters were undefined or contained unexpected values');
	}

	public static function println($msg)
	{
		echo $msg . PHP_EOL . "--------------------------------------------------" . PHP_EOL;
	}

	public static function genRandomString($length, $method = "NLUS")
	{
		$a = array(
			'N' => "0123456789",
			'L' => "abcdefghijklmnopqrstuvwxyz",
			'U' => "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
			'S' => "!@#$%^&*"
		);
		$string = "";
		$chars = "";
		foreach (str_split($method) as $m) $chars .= $a[$m];
		$max = strlen($chars) - 1;
		for ($i = 0; $i < $length; $i++) $string .= substr($chars, mt_rand(0, $max), 1);
		return $string;
	}

	public static function plainMail($to, $subject, $message)
	{
		$headers = 'From: "' . SYS_NAME . '" <' . SYS_POSTMASTER_EMAIL . '>' . PHP_EOL;
		$headers .= 'Reply-To: ' . SYS_POSTMASTER_EMAIL . PHP_EOL;
		$headers .= 'Return-Path: ' . SYS_POSTMASTER_EMAIL . PHP_EOL;
		if (!mail($to, $subject, $message, $headers)) throw new UtilException('Unable to send mail');
	}

	public static function fileGetContents($url, $parameters = array(), $opts = false, $userAgent = SYS_AGENT, $encType = PHP_QUERY_RFC1738)
	{
		if (!extension_loaded('curl')) throw new Exception("PHP extension 'cURL' is not loaded");
		if (!$opts) $opts = self::$CURL_OPTS;
		// prevent infinite request loops
		// use both methods just to be sure?
		if (isset($_SERVER['HTTP_USER_AGENT']) && $_SERVER['HTTP_USER_AGENT'] == $userAgent) throw new UtilException('Infinite request loop denied by agent');
		else if (isset($_REQUEST['userAgent']) && $_REQUEST['userAgent'] == $userAgent) throw new UtilException('Infinite request loop denied by http');
		// setup our post data
		if ($userAgent) {
			$parameters['userAgent'] = $userAgent;
			$opts[CURLOPT_USERAGENT] = $userAgent;
		}
		// setup our curl handle
		$ch = curl_init($url);
		// build our post data if found
		if ($parameters) $opts[CURLOPT_POSTFIELDS] = http_build_query($parameters, null, '&', $encType);
		curl_setopt_array($ch, $opts);
		$result = curl_exec($ch);
		// did any errors occur?
		$errorNumber = (int) curl_errno($ch);
		$errorString = curl_error($ch);
		curl_close($ch);
		// oops! request failed
		if ($errorNumber !== 0) throw new UtilException('cURL Request Error (' . $errorNumber . ')[' . $errorString . ']');
		return $result;
	}

	public static function parseUrl($url) 
	{
		$r  = "^(?:(?P<scheme>\w+)://)?";
		$r .= "(?:(?P<login>\w+):(?P<pass>\w+)@)?";
		$ip = "(?:[0-9]{1,3}+\.){3}+[0-9]{1,3}"; //ip check
		$s  = "(?P<subdomain>[-\w\.]+)\.)?"; //subdomain
		$d  = "(?P<domain>[-\w]+\.)"; //domain
		$e  = "(?P<extension>\w+)"; //extension
		$r .= "(?P<host>(?(?=".$ip.")(?P<ip>".$ip.")|(?:".$s.$d.$e."))";
		$r .= "(?::(?P<port>\d+))?";
		$r .= "(?P<path>[\w/]*/(?P<file>\w+(?:\.\w+)?)?)?";
		$r .= "(?:\?(?P<arg>[\w=&]+))?";
		$r .= "(?:#(?P<anchor>\w+))?";
		$r  = "!$r!"; // Delimiters
		preg_match($r, $url, $out);
		return $out;
	}

	public static function remoteFileExists($path)
	{
		return (@fopen($path,"r")==true);
	}
	
	public static function validEmail($email)
	{
		$isValid = true;
		$atIndex = strrpos($email, "@");
		if (is_bool($atIndex) && !$atIndex) $isValid = false;
		else {
			$domain = substr($email, $atIndex+1);
			$local = substr($email, 0, $atIndex);
			$localLen = strlen($local);
			$domainLen = strlen($domain);
			if ($localLen < 1 || $localLen > 64) $isValid = false;
			else if ($domainLen < 1 || $domainLen > 255) $isValid = false;
			else if ($local[0] == '.' || $local[$localLen-1] == '.') $isValid = false;
			else if (preg_match('/\\.\\./', $local)) $isValid = false;
			else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain)) $isValid = false;
			else if (preg_match('/\\.\\./', $domain)) $isValid = false;
			else if (!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/', str_replace("\\\\","",$local))) 
				if (!preg_match('/^"(\\\\"|[^"])+"$/', str_replace("\\\\","",$local))) $isValid = false;
			if ($isValid && !(checkdnsrr($domain,"MX") || checkdnsrr($domain,"A"))) $isValid = false;
		}
		return $isValid;
	}



}

class UtilException extends Exception {}