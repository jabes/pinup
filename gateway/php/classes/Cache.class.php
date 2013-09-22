<?php

/***

@Date: 11/28/2011
@Author: Justin Bull
@Description: This class interfaces with the Memcache extension
@Dependencies:
	- memcache extension [http://php.net/manual/en/book.memcache.php]

***/

class Cache
{
	
	const mc_host = "localhost";
	const mc_port = 11211;

	private $memcache;
	
	public function __construct() 
	{
		if (!extension_loaded('memcache')) throw new Exception("PHP extension 'memcache' is not loaded");
		$this->connect();
	}
	
	public function __destruct()
	{
		$this->disconnect();
	}

	public function connect()
	{
		$this->memcache = new Memcache;
		if (!$this->memcache->connect(self::mc_host, self::mc_port)) throw new CacheException("Memcache failed to connect with server");
	}

	public function disconnect()
	{
		$this->memcache->close();
	}
	
	/*
	@param {string} $name The key that will be associated with the item.
	@param {mixed} $data The variable to store. Strings and integers are stored as is, other types are stored serialized.
	@param {string|integer} $expiration Expiration time of the item. If it's equal to zero, the item will never expire. You can also use Unix timestamp or a number of seconds starting from current time, but in the latter case the number of seconds may not exceed 2592000 (30 days).
	*/
	public function add($name, $data, $expiration = 0) 
	{
		if (isset($this->memcache) && isset($name) && !empty($data)) {
			if (is_string($expiration)) $expiration = Util::strTimeDuration($expiration);
			$this->memcache->add(md5($name), $data, false, $expiration);
		}
	}

	/*
	@param {string} $name The key that will be associated with the item.
	@param {mixed} $data The variable to store. Strings and integers are stored as is, other types are stored serialized.
	@param {string|integer} $expiration Expiration time of the item. If it's equal to zero, the item will never expire. You can also use Unix timestamp or a number of seconds starting from current time, but in the latter case the number of seconds may not exceed 2592000 (30 days).
	*/
	public function replace($name, $data, $expiration = 0)  
	{
		// NOTE: we don't use memcache `replace` because it will fail if the key does not exist
		$this->remove($name);
		$this->add($name, $data, $expiration);
	}
	
	/*
	@param {string} $name The key that will be associated with the item.
	@return {boolean} If data was found then TRUE is returned
	*/
	public function check($name) 
	{
		$b = false;
		if (isset($this->memcache) && isset($name)) {
			$d = $this->get($name);
			$b = !empty($d);
		}
		echo $b.PHP_EOL;
		return $b;
	}

	/*
	@param {string} $name The key that will be associated with the item.
	*/
	public function get($name) 
	{
		if (isset($this->memcache) && isset($name)) {
			return $this->memcache->get(md5($name));
		}
	}

	/*
	@param {string} $name The key that will be associated with the item.
	*/
	public function remove($name) 
	{
		if (isset($this->memcache) && isset($name)) {
			$this->memcache->delete(md5($name));
		}
	}

	
}

class CacheException extends Exception {}