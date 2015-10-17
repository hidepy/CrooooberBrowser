<?php

header("Access-Control-Allow-Origin: *");

$detail_path = $_GET["detail_path"];

if(isset($detail_path)){


	//echo htmlspecialchars($target_word, ENT_QUOTES);
	//$access_url = "http://ejje.weblio.jp/content/" + htmlspecialchars($target_word, ENT_QUOTES);
	//$access_url = "http://ejje.weblio.jp/content/".$target_word;
	$access_url = "http://www.croooober.com".$detail_path;

	$got_html = file_get_contents($access_url);
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