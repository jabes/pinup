<?php

class CodeBuilder
{
	
	private static $golive;
	private static $debugOn;
	private static $userAgent;
	private static $filePath;
	private static $CURL_OPTS;
	private static $files = array(
		'/prefs.js',
		'/lib.js',
		'/layout.js',
		'/ui.js',
		'/instance.js',
		'/methods.js',
		'/main.js'
	);

	// init
	function __construct($golive = false, $debugOn = false) {
		self::$golive = $golive;
		self::$debugOn = $debugOn;
		self::$CURL_OPTS = Util::$CURL_OPTS;
		self::$CURL_OPTS[CURLOPT_PORT] = 80; // config is currently set to port 8080 but google requires port 80
		self::$userAgent = SYS_NAME . "/CodeBuilder-JS/v-" . SYS_VERSION;
		self::$filePath = "http://" . SYS_FQDN . ":" . SYS_HTTP_PORT . "/work/pinup/build/js/source";
	}

	public static function compress($script, $level)
	{

		$arrLevels = array(
			0 => 'WHITESPACE_ONLY',
			1 => 'SIMPLE_OPTIMIZATIONS',
			2 => 'ADVANCED_OPTIMIZATIONS'
		);
		
		/*
		$postfields1 = http_build_query(array(
			"output_info" => "compiled_code",
			"output_format" => "text",
			"compilation_level" => $arrLevels[$level],
			"js_code" => ""
		), null, '&') . urlencode($script);
		$ch = curl_init('http://closure-compiler.appspot.com/compile');
		$opts = self::$CURL_OPTS;
		$opts[CURLOPT_POSTFIELDS] = $postfields;
		curl_setopt_array($ch, $opts);
		$output = curl_exec($ch);
		curl_close($ch);
		*/

		# PHP_QUERY_RFC1738 is required for this		
		$output = Util::fileGetContents("http://closure-compiler.appspot.com/compile", array(
			"output_info" => "compiled_code",
			"output_format" => "text",
			"compilation_level" => $arrLevels[$level],
			"js_code" => $script
		), self::$CURL_OPTS, null, PHP_QUERY_RFC1738);


		return $output;

	}

	public function getFileHeader()
	{
		ob_start();

?>
/***

  <?php echo SYS_NAME; ?> JavaScript
  <?php echo MAINSITE_URL . PHP_EOL; ?>
  @copyright: Copyright (c) <?php echo date("Y") . " " . SYS_NAME ?>. All rights reserved.
  @license: Dual licensed under the MIT or GPL Version 2 licenses.
  @version: <?php echo SYS_VERSION . "-" . (self::$debugOn ? "debug" : "minimal") . "-" . (self::$golive ? "live" : "dev") . PHP_EOL; ?>
  @date: <?php echo date('Y-m-d') . PHP_EOL; ?>

***/
<?php

		$output = ob_get_contents();
		ob_end_clean();
		return $output;

	}

	public function output()
	{
		ob_start();
		foreach (self::$files as $file) echo Util::fileGetContents(self::$filePath . $file, array(), false, self::$userAgent);
		$output = ob_get_contents();
		ob_end_clean();

		//if (self::$golive) $output = str_replace("dev.jbull.ca", "live.jbull.ca", $output);
		if (!self::$debugOn) $output = preg_replace('#{opendebug}(.+?){closedebug}#msi', '########', $output);

		ob_start();
?>
(function (window) {

	<?php
		if (!self::$golive) echo "'use strict';";
		echo $output;
	?>

}(window));

<?php
		$output = ob_get_contents();
		ob_end_clean();
		if (self::$golive) {
			if (self::$debugOn) $output = self::compress($output, 0);
			else $output = self::compress($output, 1);
		}
		ob_start();

		if (!self::$golive) {

?>
/*jslint bitwise: true, nomen: true, plusplus: true, regexp: true, white: true, browser: true */
<?php
		}

		echo $this->getFileHeader();
		echo $output;
		$output = ob_get_contents();
		ob_end_clean();
		return $output;

	}



}


