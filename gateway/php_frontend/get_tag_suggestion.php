<?php


$compare = trim($urldata['strChars']);
$arrTags = o(new Query("selectMulti"))->sql("
	SELECT 
		DISTINCT(tags.strTagName), 
		tags.strKeywordsMap,
		tags.strWebLink
	FROM tags
	WHERE tags.strTagName LIKE '%{$compare}%'
	ORDER BY tags.strTagName ASC
	LIMIT 0,10
")->run();

if ($arrTags) {
	

	foreach ($arrTags as $key => $arrTag) {
		
		$arrKeywords = array();
		# do not rely on 'Query::sql_delimiter' having the same value as 'DB_ARRAY_DELIMITER'
		$kmap = implode(Query::sql_delimiter, explode(DB_ARRAY_DELIMITER, $arrTag['strKeywordsMap']));
		# do not pass sensitive info to the frontend
		unset($arrTags[$key]['strKeywordsMap']);
		if ($kmap) {
			$arrKeywords = o(new Query("selectMulti"))->sql("
				SELECT kw.strKeyword
				FROM keywords AS kw
				WHERE kw.id IN ({$kmap})
				ORDER BY kw.strKeyword ASC
			")->run();	
		}
		$arrTags[$key]['arrKeywords'] = $arrKeywords;
		
	}
	
	
	Util::quit($arrTags);

} 



Util::quit(null);	

