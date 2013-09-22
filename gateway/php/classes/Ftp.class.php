<?php

/***

@Date: 12/13/2011
@Author: Justin Bull
@Description: This class interfaces with the FTP protocol using a php extension
@Dependencies:
	- ftp extension [http://php.net/manual/en/book.ftp.php]

***/

class Ftp {

	const ds = "/"; // directory separator

	protected $user;
	protected $pass;

	private $host;
	private $connection;
	private $cd; // current directory

	private $opts = array(
		'transfer_mode' => FTP_BINARY, // FTP_BINARY or FTP_ASCII
		'passive_mode' => true, // if false -> default to active mode
		'timeout' => 15, // seconds
		'port' => 21
	);

	private $openDirectories = array(); // keep track of open directories

	public function __construct($host = null, $user = null, $pass = null, $options = null)
	{
		if (!extension_loaded('ftp')) throw new Exception("PHP extension 'ftp' is not loaded");
		if (is_array($options)) $this->opts = array_merge($this->opts, $options);
		if ($host && $user && $pass) $this->connect($host, $user, $pass);
	}

	public function __destruct()
	{
		// if directories are left open then we will close them automagically.. for security reasons
		if (!empty($this->openDirectories)) foreach ($this->openDirectories as $dir) {
			$this->closeDirectory($dir);
		}
		$this->disconnect();
	}

	public function connect($host, $user, $pass)
	{
		$this->host = $host;
		$this->user = $user;
		$this->pass = $pass;
		$this->connection = @ftp_connect($this->host, $this->opts['port'], $this->opts['timeout']);
		if (!$this->connection) throw new FtpException("FTP could not connect");
		if (!@ftp_login($this->connection, $this->user, $this->pass)) throw new FtpException("FTP login failed");
		if (!@ftp_pasv($this->connection, $this->opts['passive_mode'])) throw new FtpException("Failed to enable passive mode");
		$this->cd = ftp_pwd($this->connection);
	}
	
	public function disconnect()
	{
		ftp_close($this->connection);
	}

	public function directoryExists($dir)
	{
		$cd = $this->cd; // $this->cd subject to change
		if ($cd === $dir) return true; // if requested directory is equal to current dir then assume it exists!
		try {
			$this->changeDirectory($dir); // try and change to requested dir
		} catch (FtpException $e) {}
		if (isset($e)) return false; // if error -> failed change to requested directory.. assume because it doesn't exist
		$this->changeDirectory($cd); // change back
		return true;
	}

	public function fileExists($file)
	{
		return is_array(ftp_nlist($this->connection, $file));
	}

	public function createDirectory($dir)
	{
		if (!$this->directoryExists($dir)) if (!@ftp_mkdir($this->connection, $dir)) throw new FtpException("Failed to create directory: {$dir}");
		return $dir;
	}

	public function emptyDirectory($dir)
	{
		#if (!$this->directoryExists($dir)) throw new FtpException("Directory does not exist: $dir");
		$paths = $this->listDirectory($dir);
		if (!empty($paths)) foreach ($paths as $path) {
			// try and remove as file and on failure assume it was directory
			if (!$this->removeFile($path) && !$this->removeDirectory($path)) throw new FtpException("Error removing path: {$path}");
		}
	}

	public function removeDirectory($dir)
	{
		if (!$this->directoryExists($dir)) throw new FtpException("Directory does not exist: {$dir}");
		// folder needs to be empty before it can be removed
		$this->emptyDirectory($dir);
		return @ftp_rmdir($this->connection, $dir);
	}

	public function removeFile($file)
	{
		return @ftp_delete($this->connection, $file);
	}

	/*
	DO NOT call directoryExists in this method!! It will result in infinite loop.
	*/
	public function changeDirectory($dir)
	{
		if ($this->cd === $dir) return false;
		if (!@ftp_chdir($this->connection, $dir)) throw new FtpException("Failed to change directory: {$dir}");
		$this->cd = ftp_pwd($this->connection);
	}
	
	public function listDirectory($dir = self::ds)
	{
		#if (!$this->directoryExists($dir)) throw new FtpException("Directory does not exist: $dir");
		return ftp_nlist($this->connection, "-A {$dir}"); //get a listing of all files including hidden files except '.' or '..'
	}

	private function changePermissions($path, $mode)
	{
		if (!@ftp_chmod($this->connection, $mode, $path)) throw new FtpException("Failed to change permissions: {$path}");
	}

	public function openDirectory($dir)
	{
		$this->changePermissions($dir, 0777);
		$this->openDirectories[] = $dir;
	}

	public function closeDirectory($dir)
	{
		$this->changePermissions($dir, 0755);
		$this->openDirectories = array_diff($this->openDirectories, array($dir)); // will preserve keys
	}

	public function fileWrite($file, $contents = "")
	{
		$fp = fopen("php://temp", "r+");
		if (!$fp) throw new FtpException("Failed to open the temp directory for reading and writing");
		if (!empty($contents) && !fputs($fp, $contents)) throw new FtpException("Failed to write contents into temp directory");
		// so that we can read what we just wrote in
		if (!rewind($fp)) throw new FtpException("Failed to rewind the file pointer position");
		if (!@ftp_fput($this->connection, $file, $fp, $this->opts['transfer_mode'])) throw new FtpException("Failed to transfer open file to remote server");
		fclose($fp);
	}
	
	public function fileMove($path1, $path2)
	{
		if (!@ftp_rename($this->connection, $path1, $path2)) throw new FtpException("Failed to move file from: {$path1} to: {$path2}");
	}


}

class FtpException extends Exception {}