<?php

header("Access-Control-Allow-Origin: *");

$target_word = $_GET["word"];

if(isset($target_word)){


	//echo htmlspecialchars($target_word, ENT_QUOTES);
	//$access_url = "http://ejje.weblio.jp/content/" + htmlspecialchars($target_word, ENT_QUOTES);
	//$access_url = "http://ejje.weblio.jp/content/".$target_word;
	$access_url = "http://www.croooober.com/bparts/search?";
	
	$get_length = isset($_GET["length"]) ? $_GET["length"] : "20";

	$get_page = isset($_GET["page"]) ? $_GET["page"] : "1";

	$params = "q=".$target_word."&per_page=".$get_length."&page=".$get_page;

	$got_html = file_get_contents($access_url.$params);
	echo $got_html;

	
	/*
	$dom = new DOMDocument;
	
	$dom->loadHTML(mb_convert_encoding(file_get_contents($access_url.$params),'HTML-ENTITIES','auto'));

	echo $dom->getElementsByTagName('title')->item(0)->textContent;

	echo "load html ok<br><br><br>";

	$xpath = new DOMXPath($dom);

	foreach($xpath->query("//div[@class='item_box']") as $node){
		echo "<br><br>node: <br>";
		var_dump($node);

		//$entries[] = $node->nodeValue;
		$entries[] = $node->textContent;
	}

	echo "<br><br><br>";

	header( 'Content-Type: application/json' );
	echo json_encode($entries);
	*/

}

?>