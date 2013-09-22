<?php

/***

@Date: 11/23/2011
@Author: Justin Bull
@Description: This class interfaces with the MySQL extension to execute queries and return the results in array format

@Notes:
	- Make sure to set the queryString value (use SQL method) before calling the CACHE method.
	- Methods that return a resultset will have an object context and are cache-able.
	- Methods in this class are chainable. ex: Class->method()->method();

@Dependencies:
	- mysql extension [http://php.net/manual/en/book.mysql.php]
	- /php/config.php
	- /php/classes/Connection.class.php
	- /php/classes/Cache.class.php

@Examples:

BASICS
--------------------------------

Method 1:
> $resource = Query::execute("%STATEMENT%");

Method 2:
> $query = new Query;
> $result = $query->sql("%STATEMENT%")->select();
> $result = $query->sql("%STATEMENT%")->cache("%OPTIONS%")->select();
> $result = $query->select("%STATEMENT%");

Method 3:
> $query = new Query("select");
> $result = $query->sql("%STATEMENT%")->run();
> $result = $query->sql("%STATEMENT%")->cache("%OPTIONS%")->run();
> $result = $query->run("%STATEMENT%");


SELECT (context:object)
--------------------------------

> $result1 = Query->select("SELECT column_name FROM table_name WHERE column_name = value");
> $result2 = Query->select("SELECT * FROM table_name WHERE column_name = value");

	OUTPUT:
	$result1 equals "value"; # if the resulting array only contains one value, then just that value is returned
	$result2 equals Array(
		"column_name1" => "value1",
		"column_name2" => "value2",
		"column_name3" => "value3"
	);

SELECTMULTI (context:object)
--------------------------------

> $result1 = Query->sql("SELECT column_name(s) FROM table_name")->selectMulti();
> $result2 = Query->sql("SELECT column_name(s) FROM table_name")->selectMulti("column_name");


	OUTPUT: 
	$result1 equals Array(
		[0] => Array(
			"column_name1" => "row1_value1",
			"column_name2" => "row1_value2",
			"column_name3" => "row1_value3"
		), 
		[1] => Array(
			"column_name1" => "row2_value1",
			"column_name2" => "row2_value2",
			"column_name3" => "row2_value3"
		),
		[2] => Array(
			"column_name1" => "row3_value1",
			"column_name2" => "row3_value2",
			"column_name3" => "row3_value3"
		)
	);
	$result2 equals Array(
		["row1_value1"] => Array(
			"column_name2" => "row1_value2",
			"column_name3" => "row1_value3"
		), 
		["row2_value1"] => Array(
			"column_name2" => "row2_value2",
			"column_name3" => "row2_value3"
		),
		["row3_value1"] => Array(
			"column_name2" => "row3_value2",
			"column_name3" => "row3_value3"
		)
	);

INSERT (context:static)
--------------------------------

> $result = Query::insert("table_name", Array(
		"column_name1" => "value1",
		"column_name2" => "value2",
		"column_name3" => "value3"
	));

	OUTPUT: 
	$result equals {Integer} Last inserted id into table_name

UPDATE (context:static)
--------------------------------

> Query::update("table_name", Array(
		"column_name1" => "value1",
		"column_name2" => "value2",
		"column_name3" => "value3"
	), Array(
		"column_name4" => "value4"
	));

REMOVE (context:static)
--------------------------------

> Query::remove("table_name", Array(
		"column_name" => "value"
	));

DESCRIBE (context:object)
--------------------------------

> $result = Query->describe("table_name");
	
	OUTPUT: 
	$result equals Array(
		["column_name1"] => Array(
			"Type" => "mediumint(8) unsigned",
			"Null" => "NO",
			"Key" => "PRI",
			"Default" => "CURRENT_TIMESTAMP",
			"Extra" => "auto_increment"
		),
		["column_name2"] => Array(
			"Type" => "mediumint(8) unsigned",
			"Null" => "NO",
			"Key" => "PRI",
			"Default" => "CURRENT_TIMESTAMP",
			"Extra" => "auto_increment"
		),
		["column_name3"] => Array(
			"Type" => "mediumint(8) unsigned",
			"Null" => "NO",
			"Key" => "PRI",
			"Default" => "CURRENT_TIMESTAMP",
			"Extra" => "auto_increment"
		)
	)
	

EXECUTE (context:static)
--------------------------------

> $resource = Query::execute("SELECT column_name(s) FROM table_name1 LEFT JOIN table_name2 ON table_name1.column_name = table_name2.column_name");
> $resource = Query("execute")->sql("SELECT column_name(s) FROM table_name1 LEFT JOIN table_name2 ON table_name1.column_name = table_name2.column_name")->run();

	OUTPUT:
	- for statements returning a resultset (SELECT): this method returns a resource on success, or FALSE on error.
	- for statements NOT returning a resultset (INSERT, UPDATE, DELETE): this method returns TRUE on success or FALSE on error.
	note: The returned result resource should be passed to mysql_fetch_array(), and other functions for dealing with result tables, to access the returned data.


***/

class Query
{
	
	const sql_delimiter = ", ";
	const sqlfn_uuid = "UUID()";
	const sqlfn_now = "NOW()";
	
	private $queryString;
	private $queryMethod;
	
	private $cache; #{resource} Reference to cache class
	private $cacheRequest; #{bool} Should we get/set cache?
	private $cacheData; #{mixed} The cached query data retrieved from memcache
	private $cacheExpiration; #{integer|string} The cache expiration time in miliseconds, or a string representation
	
	public function __construct($method = null)
	{
		if (!extension_loaded('mysql')) throw new Exception("PHP extension 'mysql' is not loaded");
		if (isset($method)) $this->queryMethod = $method;
	}
	
	/*
	@param {string} $sql SQL statement to be printed.
	@param {integer} $time Query execution duration period.
	@param {boolean} $cached Was the query result from cache?
	*/
	private static function output($sql, $time, $cached = null)
	{
		$cached = ($cached) ? "yes [{$cached}]" : "no"; 
		var_dump(trim(preg_replace("/\t/",'', $sql)));
		Util::println("Executed in: {$time} seconds." . PHP_EOL . "Cached: {$cached}");
	}

	/*
	@param {string} $str String to be checked for SQL statements.
	@returns {boolean} TRUE if provided string is an SQL statement and FALSE otherwise
	*/
	private static function isQuery($str) 
	{
		$b = false;		
		$terms = array("SELECT", "INSERT", "UPDATE", "DELETE");
		foreach($terms as $term) if (strstr($str, $term)) $b = true; 
		return $b;
	}

	/*
	@param {string} $str String to be evaluated as an SQL function.
	@returns {boolean} TRUE if provided string is an SQL function and FALSE otherwise
	*/
	private static function isFunction($str)
	{
		return in_array($str, array(self::sqlfn_uuid, self::sqlfn_now));
	}
	
	/*
	@param {array} $array Key and value pairs to be serialized for SQL insertion.
	@returns {string} Formatted string for use with SQL statements. ex: "column_name1='value1',column_name2='value2'"
	*/
	private static function serializeArray($array, $delimeter = self::sql_delimiter)
	{
		$str = "";
		foreach ($array AS $key => $val) {
			$addquotes = (is_string($val) && !is_numeric($val) && !self::isQuery($val) && !self::isFunction($val));
			$wrapper = $addquotes ? "%s = '%s'" : "%s = %s";
			if ($val === null) $val = "NULL";
			$str .= sprintf($wrapper, $key, $val) . $delimeter;
		}
		return rtrim($str, $delimeter);
	}
	
	/*
	@param {mixed} The first argument is the query string to be executed, and the proceeding arguments (if provided) will be formatted into the query string
	@returns {resource} Returns a reference to self when chaining methods.
	*/
	public function sql(/* args go here */)
	{
		$args = func_get_args();
		$sql = array_shift($args);
		$this->queryString = (count($args) > 0) ? vsprintf($sql, $args) : $sql;
		return $this;
	}
	
	/*
	@param {string} $name The key that will be associated with the item.
	@param {string|integer} $expiration Unix timestamp or a number of seconds starting from current time. If it's equal to zero, the item will never expire.
	@returns {resource} Returns a reference to self when chaining methods.
	*/
	public function cache($name = "", $expiration = 0) 
	{
		$this->cacheRequest = (ALLOW_MEMCACHE && !empty($name)) ? true : false;
		// check for cached data
		if ($this->cacheRequest) {
			if (DEVMODE) $startTime = microtime(true);
			$this->cacheName = $name;
			$this->cacheExpiration = $expiration;
			$this->cache = new Cache;
			$memData = $this->cache->get($name);
			if (is_array($memData)) {
				if (DEVMODE) self::output($this->queryString, (microtime(true) - $startTime), $name);
				$this->cacheData = $memData;
			}
		}
		return $this;
	}
	
	/*
	@param {string} $sql Sends a unique query (multiple queries are not supported) to the currently active database on the server.
	@returns {bool|mixed} Resultset statements return a resource on success and FALSE on error, other statement types return TRUE on success and FALSE on error.
	*/
	public static function execute($sql)
	{
		global $connSlave;
		if (DEVMODE) $startTime = microtime(true);
		if (!$connSlave->connection) throw new QueryException('Failed to establish a connection with database');
		$resource = mysql_query($sql, $connSlave->connection) or die(mysql_error());
		if (DEVMODE) self::output($sql, (microtime(true) - $startTime));
		return $resource; 
	}

	/*
	@description Run the defined query method.
	@param {mixed} Optional parameters that may be passed to method.
	@returns {mixed} Will return whatever the method returns
	*/
	public function run(/* args go here */)
	{
		if (isset($this->queryMethod) && method_exists($this, $this->queryMethod)) {
			$args = func_get_args();
			$result = (count($args) > 0) ? call_user_func_array(array($this, $this->queryMethod), $args) : call_user_func(array($this, $this->queryMethod));
		} else throw new QueryException('The requested query method does not exist');
		return (isset($result)) ? $result : null;
	}
	
	/*
	@param {string} $sql An optional query string to be executed.
	@returns {array|string} Single-dimensional array containing the requested database records. If resulting array only contains one value, then just that value is returned. While said value may be numeric, it will be a string type. If no data is found, Null is returned.
	*/
	public function select($sql = null) 
	{
		if ($this->cacheRequest && !empty($this->cacheData)) return $this->cacheData;
		else {
			if (isset($sql)) $this->sql($sql);
			$result = self::execute($this->queryString);
			// we only allow one row (result) in this function
			// use "Query::selectMulti" if you want multiple rows (results)
			if (mysql_num_rows($result) === 1) {	
				$assoc = mysql_fetch_assoc($result);
				if (count($assoc) === 1) {
					$item = array_values($assoc);
					$arrData = stripslashes($item[0]);
				} else foreach ($assoc as $key => $value) $arrData[$key] = stripslashes($value);
			}
			// note: this wont cache if $arrData is empty
			if ($this->cacheRequest) $this->cache->replace($this->cacheName, $arrData, $this->cacheExpiration);
		}
		return (isset($arrData)) ? $arrData : null;
	}

	/*
	@param {string} $key An optional column name that is used to grab that columns value, and use it as the top level array key.
	@param {string} $sql An optional query string to be executed.
	@returns {array} Multi-dimensional array containing the requested database records. 
	*/
	public function selectMulti($key = null, $sql = null) 
	{
		if ($this->cacheRequest && !empty($this->cacheData)) return $this->cacheData;
		else {
			if (isset($sql)) $this->queryString = $sql;
			$result = self::execute($this->queryString);
			$arrData = array();
			while ($row = mysql_fetch_assoc($result)) {
				if (isset($key) && array_key_exists($key, $row)) {
					$keyval = $row[$key];
					unset($row[$key]);
					if (!array_key_exists($keyval, $arrData)) $arrData[$keyval] = array();
					$arrData[$keyval][] = $row;
				} else $arrData[] = $row;
			}
			/*
			
			if the values in our dataset are arrays and only contain 1 value, bump them up a level
			
			EXAMPLE 1:
			
			>	Array(
			>		[0] => Array(
			>			[strImagePath] => "http://www.website.com/images/flower.jpg"
			>		),
			>		[1] => Array(
			>			[strImagePath] => "http://www.website.com/images/sky.jpg"
			>		)
			>	)
			
			WILL BECOME:

			>	Array(
			>		[0] => "http://www.website.com/images/flower.jpg",
			>		[1] => "http://www.website.com/images/sky.jpg"
			>	)

			EXAMPLE 2:
			
			>	Array(
			>		["http://www.website.com/images/flower.jpg"] => Array(
			>			[0] => Array(
			>				[strGUID] => "584ee735-87ae-42ca-9c87-5dea9e762dbf",
			>				[strName] => "Flower"
			>			)
			>		),
			>		["http://www.website.com/images/sky.jpg"] => Array(
			>			[0] => Array(
			>				[strGUID] => "667bc6f7-4228-47ed-b3e2-0c2f17800ea6",
			>				[strName] => "Sky"
			>			)
			>		)
			>	)
			
			WILL BECOME:

			>	Array(
			>		["http://www.website.com/images/flower.jpg"] => Array(
			>			[strGUID] => "584ee735-87ae-42ca-9c87-5dea9e762dbf",
			>			[strName] => "Flower"
			>		),
			>		["http://www.website.com/images/sky.jpg"] => Array(
			>			[strGUID] => "667bc6f7-4228-47ed-b3e2-0c2f17800ea6",
			>			[strName] => "Sky"
			>		)
			>	)
			
			*/
			$i = 0;
			foreach ($arrData as $data) if (is_array($data)) $i += count($data);
			if (count($arrData) === $i) foreach ($arrData as $key => $data) $arrData[$key] = array_shift($data);
			// note: this wont cache if $arrData is empty
			if ($this->cacheRequest) $this->cache->replace($this->cacheName, $arrData, $this->cacheExpiration);
		}
		return (isset($arrData)) ? $arrData : null;
	}

	/*
	@param {string} $query_table The affected table.
	@param {array} $insert_values Defines the key(s)/column_name(s) and value(s) to be inserted into the table.
	@returns {integer} The affected table record id.
	*/
	public static function insert($query_table, $insert_values)
	{
		$sql_keys = implode(self::sql_delimiter, array_keys($insert_values));
		$sql_vals = "";
		foreach ($insert_values AS $key => $val) {
			$addquotes = (is_string($val) && !is_numeric($val) && !self::isQuery($val) && !self::isFunction($val));
			$wrapper = $addquotes ? "'%s'" : "%s";
			if ($val === null) $val = "NULL";
			$sql_vals .= sprintf($wrapper, $val) . self::sql_delimiter;
		}
		$sql_vals = rtrim($sql_vals, self::sql_delimiter);
		self::execute("INSERT IGNORE INTO {$query_table} ({$sql_keys}) VALUES ({$sql_vals}) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)");
		return mysql_insert_id();
	}

	/*
	@param {string} $query_table The affected table.
	@param {array} $insert_values Defines the key(s)/column_name(s) and value(s) to be updated in the table.
	@param {array} $conditional_values Defines which record to be updated by key(s)/column_name(s) and desired value(s).
	@returns {boolean} TRUE on success and FALSE on failure.
	*/
	public static function update($query_table, $insert_values, $conditional_values)
	{
		$sql_set = self::serializeArray($insert_values);
		$sql_where = self::serializeArray($conditional_values, " AND ");
		self::execute("UPDATE {$query_table} SET {$sql_set} WHERE {$sql_where}");
		return mysql_affected_rows();
	}

	/*
	@param {string} $query_table The affected table.
	@param {array} $conditional_values Defines which record to be deleted by key(s)/column_name(s) and desired value(s).
	@returns {boolean} TRUE on success and FALSE on failure.
	*/
	public static function remove($query_table, $conditional_values)
	{
		$sql_where = self::serializeArray($conditional_values, " AND ");
		self::execute("DELETE FROM {$query_table} WHERE {$sql_where}");
		return mysql_affected_rows();
	}

	/*
	@description Provides information about the columns in a table. 
	@param {string} $query_table The affected table.
	@returns {array} An array, indexed by column names, which contains an array with info on the column
	*/
	public function describe($query_table)
	{
		return $this->sql("DESCRIBE {$query_table}")->selectMulti("Field");
	}


}

class QueryException extends Exception {}