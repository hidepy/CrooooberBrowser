/*
 *
 * メイン画面のイベント
 *
 */
 
function button_clicked(event){
	console.log("button_clicked event driven");

	getHeaderInfo(event);
}

function button_clicked_to_local(){
	var url = "users/getTestData.php";

	sendRequest(url, "", 1);
}

function button_clicked_clear(event){
	document.getElementById("search_key").value = "";

}

//検索キー入力エリアでEnterボタン押下時処理
function textbox_enter_pressed(event){
	button_clicked();
}





/*
 *
 * 商品詳細画面のイベント
 *
 */

//詳細ページのサムネイル画像押下時
function detail_thumbnail_clicked(event){
	console.log("thumb nail clicked");
	document.querySelector("#d_pic > img").setAttribute("src", event.src);
}

//詳細ページの閉じるボタン
function detail_close_clicked(event){
	console.log("close clicked");
}

//さらに検索ボタン
function search_more_button_clicked(event){
	console.log("searh more button clicked");

	getHeaderInfoMore(event);

}

function detail_open_croooober_page(event){
	console.log("detail_open_croooober_page");

	var url = event.target.getAttribute("crooooberPageUrl");

	window.open(url, "_system","");

}


/*
 *
 *イベントハンドラの登録 
 *
 */

$(document).ready(function(){

	//Enter押下イベントのアタッチ
	$("#search_key").keydown(function(event){
		if(event.which == 13){
			console.log("enter event driven");
			textbox_enter_pressed();
		}
		
		
	});

	//検索ボタン押下イベントのアタッチ
	$("#search_button").click(function(event){
		console.log("search button click event driven");
		button_clicked();
	});

	//さらに検索ボタン押下イベントのアタッチ
	$("#button_search_more").click(function(event){
		console.log("search more button click event driven");
		search_more_button_clicked(event.target);
	});

	//トップへ
	$("#f_to_top").click(function(){
		$( 'html,body' ).animate( {scrollTop:0} , 'slow' ) ;
    });

    $("#d_button2Croooober").click(function(event){
    	detail_open_croooober_page(event);
    });

});