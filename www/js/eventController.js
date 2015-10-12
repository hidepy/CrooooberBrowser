function button_clicked(){

	var url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContents.php?";
	//var url = "http://www.croooober.com/bparts/search?";
	var search_key = document.getElementById("search_key").value;

	if((search_key != null) && (search_key != "")){

		var parameters = "";
		{
			parameters += "word=" + encodeURIComponent(search_key);
			parameters += "&length=50";
		}

		sendRequest(url, parameters, 1);
	}
	else{
		outLog("no search key...");
	}
}

function button_clicked_to_local(){
	var url = "users/getTestData.php";

	sendRequest(url, "", 1);
}

function button_clicked_clear(event){
	document.getElementById("search_key").value = "";

}

//検索キー入力エリアでENterボタン押下時処理
function textbox_enter_pressed(event){
	button_clicked();
}


/* イベントハンドラの登録 */
$(document).ready(function(){

	//Enter押下イベントのアタッチ
	$("#search_key").keydown(function(event){
		if(event.which == 13){
			console.log("in enter event");
			textbox_enter_pressed();
		}
		
		
	});

	//検索ボタン押下イベントのアタッチ
	$("#search_button").click(function(event){
		button_clicked();
	});

	
	/*
	//テスト
	var values = {
	  title: 'Hello Handlebars!',
	  img: {
	    url: 'http://example.com',
	    alt: 'Something..'
	  },
	  text: 'My first Handlebars!'
	};
	var template = Handlebars.compile($('#input').html());

	$('#output').html(template(values));
	*/
});