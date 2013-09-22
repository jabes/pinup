<?php

/*!
 *	@date: 20/07/2011
 *	This class is based off the work of:
 *	Original Author: Thomas Björk
 *	Link: http://www.phpclasses.org/package/1289-PHP-CSS-parser-class.html
 */

class CssParser {

	public $css;

	function __construct()
	{
		$this->clear();
	}

	function __destruct() 
	{
		unset($this->css);
	}

	public function clear() 
	{
		unset($this->css);
		$this->css = array();
	}

	public function remove($selector, $property) 
	{
		$selector = (string) trim($selector);
		if ($property)
		{
			$property = (string) trim($property);
			if (isset($this->css[$selector][$property]))
			{
				unset($this->css[$selector][$property]);
			}
		} else {
			if (isset($this->css[$selector])) {
				unset($this->css[$selector]);
			}
		}
	}

	public function add($selector, $declaration) 
	{
		$styles = array();
		$selector = (string) trim($selector);
		$declaration = explode(";", $declaration);
		if (!isset($this->css[$selector])) $this->css[$selector] = array();
		if (count($declaration) > 0) 
		{	
			foreach($declaration as $style) 
			{
				if (strlen($style) > 0) 
				{
					$pieces = explode(":", trim($style));
					$property = trim(array_shift($pieces));
					$value = trim(implode(":", $pieces));
					if (strlen($property) > 0 && strlen($value) > 0) 
					{
						if (!isset($styles[$property])) $styles[$property] = array();
						$styles[$property][] = $value;
					}
				}
			}
			foreach($styles as $property => $values) $this->css[$selector][$property] = $values;
		}
		return $styles;
	}

	public function parseStr($css) 
	{
		$this->clear();
		// Remove comments
		$css = preg_replace("/\/\*(.*)?\*\//Usi", "", $css);
		// Parse this damn csscode
		$pieces = explode("}", $css);
		if (count($pieces) > 0) 
		{
			// remove the last array item which will just be the whitespace from the final curly bracket
			array_pop($pieces); 
			foreach($pieces as $part) 
			{
				list($keystr, $declaration) = explode("{", $part);
				$selectors = explode(",", trim($keystr));
				if (count($selectors) > 0) 
				{
					foreach($selectors as $key => $selector) 
					{
						if (strlen($selector) > 0) 
						{
							$selector = trim(str_replace("\n", "", $selector));
							$selectors[$key] = $selector;
						}
					}
					$selector = implode(", ", $selectors);
					if (strlen($selector) > 0) $this->add($selector, trim($declaration));
				}
			}
		}
		return (count($this->css) > 0);
	}

	/*
	public function Parse($filename) {
		$this->clear();
		if (file_exists($filename)) 
			return $this->parseStr(file_get_contents($filename));
		else return false;
	}
	*/

	public function getCSS($compact = false) 
	{
		$result = "";
		foreach($this->css as $selector => $styles) {
			if (!$compact) $selector = implode(",\n", explode(", ", $selector));
			$declaration = "";
			foreach($styles as $property => $values) 
			{
				foreach($values as $value)
				{
					$declaration .= ($compact) ? "$property:$value;" : "\t$property: $value;\n";
				}
			}
			$result .= ($compact) ? "$selector{".rtrim($declaration, "; ")."}\n" : "$selector\n{\n$declaration}\n";
		}
		return $result;
	}


}

