<?php

/***

@Date: 7/16/2011
@Author: Justin Bull
@Description: This class manages all methods related to site data
@Dependencies:
	- /php/classes/Query.class.php
	- /php/classes/Util.class.php

***/

class Site 
{

	private $pubkey;
	private $siteInfo;
	
	public $referer; // client http referer
	public $ipaddr; // client IP address
	public $domainExceptions;

	public function __construct($guid)
	{
		if ($guid) $this->pubkey = $guid;
		$this->referer = null;
		$this->ipaddr = null;
		$this->domainExceptions = array();
	}
	
	private static function getDomain($url)
	{
		$scheme = parse_url($url, PHP_URL_SCHEME);
		if (!$scheme) $url = "//" . $url;
		$host = parse_url($url, PHP_URL_HOST);
		$host_parts = explode('.', $host);
		$domain_parts = array_slice($host_parts, -2);
		$domain_str = implode('.', $domain_parts);
		return strtolower($domain_str);
	}

	// query our site data if needed
	public function retrieveData() 
	{
		if ($this->pubkey) {
			// dont query user info if we already have it
			if (!$this->siteInfo) {
				$this->siteInfo = o(new Query)->select("SELECT * FROM sites WHERE strGUID = '{$this->pubkey}' LIMIT 0,1");
				if (!$this->siteInfo) throw new SiteException('Invalid public key');
			}
			return $this->siteInfo;
		}
	}
	
	public function verify() 
	{
		if (!$this->siteInfo || !isset($this->siteInfo['bVerified']) || $this->siteInfo['bVerified'] !== '1') {
			throw new SiteException('Site not verified');
		}
	}
	
	// NOTE: HTTP_REFERER can be spoofed, do not rely on it
	public function checkHost()
	{
		if (!isset($this->siteInfo['strURL'])) throw new SiteException('Host not provided');
		$url = $this->siteInfo['strURL'];
		$isip = filter_var($url, FILTER_VALIDATE_IP);
		$siteHost = $isip ? $url : self::getDomain($url);
		$refererHost = $isip ? $this->ipaddr : (isset($this->referer) ? self::getDomain($this->referer) : null);
		#$siteHost = "google.com";
		#$refererHost = "jbull.ca";
		if (!isset($siteHost) || !isset($refererHost)) throw new SiteException('Undefined host');
		/*
		the incoming host must match their defined host
		except for one exception: the incoming host may be ours
		this exception is for the theme manager, which needs to load under their GUID not ours..
		*/
		if ($siteHost !== $refererHost && !in_array($refererHost, $this->domainExceptions)) throw new SiteException('Invalid host');
	}

	// NOTE: `HTTP_REFERER` can be spoofed, do not rely on it
	public function checkSubdomain($passive = true) 
	{
		if (isset($this->referer)) {
			$refererHost = self::getDomain($this->referer);
			$parsed = Util::parseUrl($this->referer);
		} else if (!$passive) throw new SiteException('Http referer not found');
		if (isset($parsed)) $isSubdomain = (!empty($parsed['subdomain']) && $parsed['subdomain'] !== 'www') ? true : false;
		if (isset($refererHost)) if (in_array($refererHost, $this->domainExceptions)) return; // exception
		if (isset($isSubdomain) && array_key_exists('bSubdomains', $this->siteInfo)) {
			if ($isSubdomain === true && $this->siteInfo['bSubdomains'] == 0) throw new SiteException('Site does not allow subdomains');
		} else if (!$passive) throw new SiteException('Unknown error while checking subdomain');
	}

	public static function register($siteDomain, $siteName, $userId)
	{
		if (empty($siteDomain) || empty($siteName) || empty($userId)) $err = "INSUFFICIENT DATA";
		else if (o(new Query)->select("SELECT id FROM sites WHERE strURL='{$siteDomain}'")) $err = "WEBSITE ALREADY REGISTERED";
		
		if (isset($err)) return $err;
		
		// CREDENTIALS MET ~~~ CONTINUE

		$nSiteID = Query::insert("sites", array(
			'strSiteName' => $siteName,
			'strURL' => $siteDomain,
			'strGUID' => Query::sqlfn_uuid
		));
		if (!$nSiteID) throw new QueryException('Failed to insert site record into database');
		$nAccSiteID = Query::insert("accountssites", array(
			'nAccountsID' => $userId,
			'nSitesID' => $nSiteID,
			'strGUID' => Query::sqlfn_uuid
		));
		if (!$nAccSiteID) throw new QueryException('Failed to insert site<->account link record into database');
		
		// the record will inherit all default values
		if (!Query::insert("sitessettings", array(
			'nSitesID' => $nSiteID
		))) throw new QueryException('Failed to insert site settings record into database');

		return $nSiteID;
		
	}

}

class SiteException extends Exception {}

