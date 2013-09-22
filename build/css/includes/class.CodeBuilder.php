<?php

class CodeBuilder {

	private static $userAgent;
	private static $theme;
	private static $compress;
	private static $mapDirectory;
	
	function __construct($compress = false, $theme = null)
	{
		self::$compress = $compress;
		self::$theme = $theme;
		self::$userAgent = SYS_NAME . "/CodeBuilder-CSS/v-" . SYS_VERSION;
		self::$mapDirectory = array(
			'baseClass' =>  "http://" . SYS_FQDN . ":" . SYS_HTTP_PORT . "/work/pinup/build/css/base.css",
			'themeFolder' =>"http://" . SYS_FQDN . ":" . SYS_HTTP_PORT . "/work/pinup/build/css/themes"
		);	
	}

	public function output() 
	{
		
		$dirBase = self::$mapDirectory["baseClass"];
		$cssBase = Util::fileGetContents($dirBase, array(), false, self::$userAgent);
		$cssBaseParser = new CssParser();
		$cssBaseParser->parseStr($cssBase);
		
		if (self::$theme && self::$theme !== "default")
		{
			
			$dirTheme = self::$mapDirectory["themeFolder"] . "/" . self::$theme . ".css";
			$cssTheme = Util::fileGetContents($dirTheme, array(), false, self::$userAgent);
			$cssThemeParser = new CssParser();
			$cssThemeParser->parseStr($cssTheme);

			foreach ($cssThemeParser->css AS $selector => $styles) 
			{
				
				$declaration = "";
				
				foreach ($styles AS $property => $values) 
				{
					foreach ($values AS $value) 
					{
						if ($property === "remove" && $value === "all") $cssBaseParser->remove($selector);
						else if ($value === "null") $cssBaseParser->remove($selector, $property);
						else $declaration .= $property . ":" . $value . ";";
					}
				}

				if (strlen($declaration) > 0) $cssBaseParser->add($selector, $declaration);
			}

		}

		ob_start(); 

?>
/***

  <?php echo SYS_NAME; ?> CSS
  <?php echo MAINSITE_URL . PHP_EOL; ?>
  @copyright: Copyright (c) <?php echo date("Y") . " " . SYS_NAME ?>. All rights reserved.
  @license: Dual licensed under the MIT or GPL Version 2 licenses.
  @version: <?php echo SYS_VERSION . "-" . (self::$compress ? "live" : "dev") . "-" . self::$theme . PHP_EOL; ?>
  @date: <?php echo date('d/m/Y') . PHP_EOL; ?>

***/
<?php

		echo $cssBaseParser->getCSS(self::$compress);

		$output = ob_get_contents(); 
		ob_end_clean(); 

		return $output;

	}

}

