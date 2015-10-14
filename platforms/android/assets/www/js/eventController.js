function button_clicked(event){
	getHeaderInfo(event);
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