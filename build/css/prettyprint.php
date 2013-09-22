<?php

$cssInput = isset($_POST['cssInput']) ? $_POST['cssInput'] : null;
$bCompress = (isset($_POST['bCompress']) && $_POST['bCompress'] === "yes") ? true : false;

if ($cssInput) {

	header("content-type: text/css");
	
	require_once dirname(__FILE__) . "/includes/CssParser.php";
	
	$parser = new CssParser();
	$parser->parseStr($cssInput);
	echo $parser->getCSS($bCompress);

} else {

	header("content-type: text/html");

?><!DOCTYPE html>
<html><head>
	<title>CSS Pretty Print</title>
	<link href="../../cdn/global-images/favicon.ico" type="image/x-icon" />
	<style>
	html, body{margin:0;padding:0}
	.header{display:block;margin:0;padding:10px;height:40px;line-height:40px;color:#E56059;text-shadow:1px 1px 1px #888888}
	#prettyPrint{display:block;margin:0;padding:0;width:100%;height:auto;position:absolute;top:50px;right:0;bottom:0;left:0}
	#prettyPrint .inputHolder{padding:4px;position:absolute;top:10px;right:10px;bottom:50px;left:10px;border:1px solid #888;background:#FFF;-moz-box-shadow:inset 2px 2px 2px #BBB;-webkit-box-shadow:inset 2px 2px 2px #BBB;box-shadow:inset 2px 2px 2px #BBB}
	#prettyPrint .inputHolder textarea{display:block;width:100%;height:100%;margin:0;padding:0;border:none;background:none;color:#555}
	#prettyPrint .parseButton{display:block;width:150px;padding:3px 0;cursor:pointer;position:absolute;top:auto;right:10px;bottom:10px;left:auto}
	#prettyPrint .chkCompress{position:absolute;top:auto;right:auto;bottom:10px;left:10px;height:30px;line-height:30px}
	#prettyPrint .chkCompress input{margin:0;padding:0;position:relative;top:2px}
	</style>
	<script>
	window.onload=function(){document.getElementById("prettyPrint").elements.cssInput.focus()};
	</script>
</head><body>
	<h1 class="header">CSS Pretty Print</h1>
	<form id="prettyPrint" method="post">
		<div class="inputHolder"><textarea name="cssInput"></textarea></div>
		<label class="chkCompress"><input name="bCompress" type="checkbox" value="yes" /> compress the css?</label>
		<input class="parseButton" type="submit" value="PARSE THE CSS" />
	</form>
</body></html><?php
	
}
