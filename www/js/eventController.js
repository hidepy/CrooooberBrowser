/*
 *
 * メイン画面のイベント
 *
 */
 
function button_clicked(event){
	console.log("button_clicked event driven");

	//詳細検索エリアの値はクリアする
	search_condition_clear();

	getHeaderInfo();
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
	console.log("in textbox_enter_pressed");
	button_clicked();
}

//保存された検索条件を押下された
//	検索処理を実行する
function stored_search_condition_item_clicked(event){

	var key = event.getAttribute("hashkey");

	getHeaderInfoFromStoredCondition(key);
}

//検索条件を保存 ボタン
function store_search_condition_clicked(){
	console.log("in store_search_condition_clicked");
	addSearchCondition();
}


/*
 *
 * 商品詳細画面のイベント
 *
 */

//詳細ページのサムネイル画像押下時
function detail_thumbnail_clicked(event){
	console.log("thumb nail clicked");
	//document.querySelector("#d_pic > img").setAttribute("src", event.src);
	$("#item_img").css("background-image", "url("+event.src+")");
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

function search_condition_bunrui_select(event, prefix){
	console.log("search condition bunrui select");

	prefix = (prefix) ? prefix : "";

	//$("#search_condition_bunrui_list_wrapper > li").attr("class", "");
	$("#search_condition_bunrui_list_wrapper" + prefix + " > li").removeClass("bunrui_list_selected");

	var el_target = (event.target.tagName.toLowerCase() == "a") ? event.target.parentNode : event.target;
	//el_target.className = "bunrui_list_selected";
	$(el_target).addClass("bunrui_list_selected");
}


/*
 *
 * 詳細検索画面のイベント
 *
 */
//検索条件クリア
function search_condition_clear(){
	console.log("search condition clear");

	$("#setting_search_condition_keyword").val("");
	$("input[name=search_condition_sort]").val(["1"]);
	$("#search_condition_bunrui_list_wrapper > li").removeClass("bunrui_list_selected");
	$("#search_condition_bunrui_list_wrapper_car > li").removeClass("bunrui_list_selected");
	$("#setting_search_condition_kakaku_low").val("");
	$("#setting_search_condition_kakaku_high").val("");
}

//詳細検索条件作成
function create_search_condition_params(){

	var sort_kbn = $("input[name=search_condition_sort]:checked").val();
	
	var bunrui_cd = (function(){
		
		var is_car = ($('input[name=select_bike_or_car]:checked').val() == "car");

		var query = is_car ? "_car" : "";

		var el_selected_bunrui = document.querySelector("#search_condition_bunrui_list_wrapper" + query + " > .bunrui_list_selected");

		var res = ((el_selected_bunrui) ? el_selected_bunrui.id : "").replace("licat", "");

		if(res.length == 4){
			return ((is_car ? "01_" : "20_") + res.substr(0, 2) + "_" + res.substr(2, 2));
		}

		return "";

	})();	

	var detail_param = {
		word: $("#setting_search_condition_keyword").val(),
		connector: "and",
		bunrui: bunrui_cd,
		kakaku_low: $("#setting_search_condition_kakaku_low").val(),
		kakaku_high: $("#setting_search_condition_kakaku_high").val(),
		sort: sort_kbn || "1"
	};

	return detail_param;
}

//詳細検索ボタン押下時
function search_condition_search_button(){
	console.log("search_condition_search_button");

	//詳細検索条件を生成
	var detail_param = create_search_condition_params();

	//先にページに戻る
	$('body').pagecontainer('change', '#page_main',　{ transition: 'slide' } );

	getHeaderInfo(detail_param);
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

	//詳細検索ボタン押下
	$("#detail_search_setting_button").click(function(event){
		$('body').pagecontainer('change', '#page_setting_search_condition',　{ transition: 'slide' } );
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

    //検索条件を保存
    $("#button_store_search_condition").click(function(){
    	console.log("in store search condition clicked");
		store_search_condition_clicked();
    });

	//ブラウザで開くボタン
    $("#d_button2Croooober").click(function(event){
    	detail_open_croooober_page(event);
    });

    // 詳細検索条件クリア
    $("#search_condition_clear").click(function(event){
    	search_condition_clear();
    });

    // 分類リストのクリックイベント(バイク)
    $("#search_condition_bunrui_list_wrapper > li").click(function(event){
    	search_condition_bunrui_select(event);
    });

    // 分類リストのクリックイベント(車)
    $("#search_condition_bunrui_list_wrapper_car > li").click(function(event){
    	search_condition_bunrui_select(event, "_car");
    });

    //詳細検索ボタン
    $("#detail_search_button").click(function(event){
    	search_condition_search_button();
    });

    //バイク/車検索ラジオボタン選択
    //$("#select_bike_or_car_bike").change(function(event){
    $("input[name=select_bike_or_car]").change(function(event){
    	console.log("radio button change event");

    	var current_target = event.target.getAttribute("value");

    	//詳細検索内のリスト可視性を変更
		controlBunruiList(current_target);
    });

});