<?php

/***

@Date: 11/23/2011
@Author: Justin Bull
@Description: This class interfaces with the MySQL extension to create a public connection object
@Dependencies:
	- mysql extension [http://php.net/manual/en/book.mysql.php]

***/

class Connection
{
	
	protected $host;
	protected $user;
	protected $pass;
	protected $table;

	public $connection; // Query class depends on this

	public function __construct($host = null, $user = null, $pass = null, $table = null) 
	{
		if (!extension_loaded('mysql')) throw new Exception("PHP extension 'mysql' is not loaded");
		if ($host && $user && $pass && $table) $this->connect($host, $user, $pass, $table);
	}
	
	public function __destruct()
	{
		$this->disconnect();
	}

	// make the connection
	public function connect($host, $user, $pass, $table)
	{
		$this->host = $host;
		$this->user = $user;
		$this->pass = $pass;
		$this->table = $table;
		$this->connection = mysql_connect($this->host, $this->user, $this->pass);
		if (!$this->connection) throw new ConnectionException("Could not connect with MySQL");
		if (!mysql_select_db($this->table, $this->connection)) throw new ConnectionException("Could not connect with database");
	}

	public function disconnect()
	{
		if ($this->connection) mysql_close($this->connection);
	}

	/*
	This method is a little out of place here, but it relies on a connection so..
	*/
	public static function cleanData($data)
	{
		if (is_array($data)) foreach ($data as $k => $v) $data[$k] = Connection::cleanData($v); //recursive
		elseif (is_string($data)) $data = mysql_real_escape_string($data);
		return $data;
	}


}

class ConnectionException extends Exception {}