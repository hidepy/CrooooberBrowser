var is_debug = false;

var template_item_headers;
var template_item_detail;
var template_favorite;
var template_search_condition;

var header_search_url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContents.php?";
var header_search_url_direct = "http://www.croooober.com/bparts/search?"; //※※
var detail_search_url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContentDetail.php?";

var croooober_url = "http://www.croooober.com";

var storageManager;

//現在表示されている商品リストを保持しておく
var current_header_items = [];

//現在の検索条件c
var current_search_condition = {};

//検索トップのタイプ(0->通常, 1->jqでparse, 2->直croooober&jqでparse)
var _debugging_type = "0";

if(is_debug){
	header_search_url = "http://localhost/CrooooberBrowser/debug_html.txt";
	detail_search_url = "http://localhost/CrooooberBrowser/debug_html_detail.txt";
}


/*
$(document).ready(function(){

	// ストレージからキャッシュ済の商品詳細を取得
	storageManager = new StorageManager();

	// バイク用品検索か車用品検索か決定
	$("input[name=select_bike_or_car]").val([storageManager.searchType]);
	// 検索区分によって、詳細検索内のリスト可視性を変更する
	controlBunruiList(storageManager.searchType);
});
*/

function createResultItemsHeader(data, type, parameters){ //type: 検索回数
	console.log("in createResult.");
	//outLog(data); //ここまで来てる

	var dom_parser = new DOMParser();
	var got_html_document = null;

	try{

		var el_item_box = null;

		if((_debugging_type != "1") && (_debugging_type != "2")){ //デフォルトルートの場合

			got_html_document = dom_parser.parseFromString(data, "text/html");

			if(got_html_document == null){
				outLog("got_html_document is null...");

				return false;
			}
			
			//parseに失敗した場合...
			if(got_html_document.getElementsByTagName("parsererror").length > 0){
				got_html_document = null;
			}

			//検索結果の件数取得
			var search_result_num = got_html_document.querySelector(".search_result_num");
			var search_result_max_num = "-";
			if(search_result_num){

				//最大件数の取得
				search_result_max_num = search_result_num.querySelector("span").innerHTML;

				search_result_max_num = (search_result_max_num != null) ? search_result_max_num.replace(",", "") : "";

				//いったんけす
				//document.getElementById("search_result_num").innerHTML = "ヒット件数：　" + search_result_max_num;//search_result_num.innerHTML;
			}

			//console.log(JSON.stringify(got_html_document));

			el_item_box = got_html_document.querySelectorAll(".item_box");
		}
		else{
			var dom = jQuery.parseHTML(data);
			el_item_box = $(".item_box", dom);
		}

		


		//前回取得したアイテム数
		var el_search_more_button = document.getElementById("button_search_more"); //さらに検索 ボタン
		var previous_length_str = el_search_more_button.getAttribute("current_display_item_length");
		var previous_length = (previous_length_str && previous_length_str != "") ? Number(previous_length_str) : 0;

		if(type == 1){
			//初回検索になった場合、件数をリセット
			previous_length = 0;
		}

		//var item_header_data = {};
		var item_header_data = [];

		for(var i = 0; i < el_item_box.length; i++){
			var el = el_item_box[i];
			var el_feature = el.querySelector(".box_in > ul");

			var data = {
				item_number: (i + 1) + previous_length,
				title: el.querySelector("h3 > a").innerHTML,
				detail_url: el.querySelector("h3 > a").getAttribute("href"),
				feature: el_feature,
				price: el.querySelector(".price span").innerHTML,
				pic_url: el.querySelector("img").getAttribute("src").replace("//", "http://"),
				is_newArrival: (el_feature.querySelector(".i_li01")) ? "h_newArrival_show" : "h_newArrival_hide",
				is_new: (el_feature.querySelector(".i_li02")) ? "h_new_show" : "h_new_hide",
				is_old: (el_feature.querySelector(".i_li03")) ? "h_old_show" : "h_old_hide",
				is_junk: (el_feature.querySelector(".i_li04")) ? "h_junk_show" : "h_junk_hide"
			};

			item_header_data[i] = data;
		}

		//検索結果の商品一覧にデータをはめ込む
		{
			if(type == 1){ 
				//初回検索の場合、現在のビューをリセット
				//$("#contents_wrapper").empty();
				
				//直前まで保存していた商品リストを破棄
				current_header_items = [];

			}

			var display_data;

			//続いて検索の場合、前回検索までの値を連結する
			if(type > 1){
				console.log("searching with " + type + "times, concatting previous array");
				display_data = current_header_items.concat(item_header_data);
			}
			else{
				display_data = item_header_data;
			}

			console.log("current data length: " + display_data.length);

			//前回までの値に結果を格納しておく
			current_header_items = display_data;
		}

		//次を読み込むボタンの作成
		{
			//検索条件を保存
			el_search_more_button.setAttribute("search_condition", JSON.stringify(parameters));

			//try(再読み込み回数をセット)
			el_search_more_button.setAttribute("try_num", type);

			//最大件数のセット
			el_search_more_button.setAttribute("max_length", search_result_max_num);

			//現在の表示数のセット
			el_search_more_button.setAttribute("current_display_item_length",  previous_length + el_item_box.length);

			//最大件数に、今回検索数が達していない場合、表示状態にする
			el_search_more_button.style.display = ((previous_length + el_item_box.length) < Number(search_result_max_num)) ? "block" : "none";

		}

		//作成したデータを返却する
		return display_data;

	}
	catch(e){
		console.log(e);
	}
}


function createResultItemDetail(data, type, parameters){
	console.log("in createResultItemDetail!!");

	var dom_parser = new DOMParser();
	var got_html_document = null;

	try{
		got_html_document = dom_parser.parseFromString(data, "text/html");

		if(got_html_document == null){
			outLog("got_html_document is null...");

			return false;
		}
		
		//parseに失敗した場合...
		if(got_html_document.getElementsByTagName("parsererror").length > 0){
			got_html_document = null;
		}

		var el = got_html_document;

		var el_tbody = el.querySelectorAll(".riq01 .ta01 > tbody > tr");

		var id = parameters.detail_path.split("/")[2];
		var url = parameters.detail_path;
		var pictures = (function(el){
			var arr = [];

			var el_imges = el.querySelectorAll("#slideshow_thumb img");

			for(var i = 0; i < el_imges.length; i++){
				arr[i] = el_imges[i].getAttribute("src").replace("//", "http://");
			}

			return arr;
		})(el);

		//必要箇所を抽出
		var data = {
			id: id,
			url: url,
			full_url: (croooober_url + url),
			title: el.querySelector("#title > .item_title").innerHTML,
			price: el.querySelector(".price_box > .price_in > .price").innerHTML,
			pictures: pictures,
			picture: el.querySelector("#slideshow_thumb img").getAttribute("src").replace("//", "http://"),
			maker_name: el_tbody[0].querySelector("td > a").innerHTML,
			rank: el_tbody[1].querySelector(".star_box").innerHTML,
			//comment: el.querySelector(".riq01 .riq01_in > p").innerHTML,
			comment: el.querySelector(".riq01 .riq01_in > p > span").innerHTML,
			tbody: el.querySelector(".riq01 .ta01 > tbody").innerHTML,
			ref_date_time: formatDate(new Date())
		};

		//取得したデータを、Handlebars.jsで当てはめていく
		//console.log(data);
		
		//今回取得した情報をlocalstorageに格納
		storageManager.saveDetailItem2Storage(data);

		console.log("before set detail item to html");

		return data; //詳細情報を返却する

		//$("#detail_content_wrapper").html(template_item_detail(data));

	}
	catch(e){
		console.log(e);
	}

}

/******************************

保存した検索条件から検索の場合に、
車 / バイク のチェックボックスも保存しておかないといけない！！！！
	今は選択されているラジオボタンチェックの方で検索しちゃう

*******************************/

function getHeaderInfoFromStoredCondition(key){
	var param = storageManager.searchConditionHash[key];

	getHeaderInfo(param);
}

var msg_no_searchKey = "検索キーが入力されていません";

function getHeaderInfo(detail_param, search_key, callback){

	var url = header_search_url; //ヘッダ検索用のURL

	//var search_key = document.getElementById("search_key").value;


    // ※※ debug用。後で削除すること
    _debugging_type = $('input[name=select_searching_type_debug]:checked').val();
    console.log("デバッグ用タイプ: " + _debugging_type);

    if(_debugging_type == "2"){
    	url = header_search_url_direct;
    }



	//バイク検索又は車検索ボタンの値を保存
	//いったんけす
	storageManager.setSearchType( $('input[name=select_bike_or_car]:checked').val() );

/*
	storageManager = {};
	storageManager.getSearchType = function(){
		return "bike";
	}*/

	if(detail_param || ( (search_key != null) && (search_key != ""))){ //詳細検索条件が存在するか、又は、キーワードが存在する

		var parameters = {};
		{
			// 既存通りの動きの場合
			if(_debugging_type != "2"){
				parameters.word = encodeURIComponent(search_key); //※※
				parameters.length = 50;
				if(storageManager.getSearchType() == "car"){
					parameters.is_car_search = true; //carが選択されている場合は車用品検索
				}
			}
			else{
				parameters.q = encodeURIComponent(search_key);
				parameters.per_page = 50;
			}
		}

		if(detail_param){ //詳細検索時のパラメータ
			if(_debugging_type != "2"){ //既存通りの場合
				parameters.word = detail_param.word;
				parameters.length = 50;

				if(detail_param.connector){
					parameters.connector = detail_param.connector;
				}
				if(detail_param.bunrui){
					parameters.bunrui = detail_param.bunrui;
				}
				if(detail_param.kakaku_low){
					parameters.kakaku_low = detail_param.kakaku_low;
				}
				if(detail_param.kakaku_high){
					parameters.kakaku_high = detail_param.kakaku_high;
				}
				if(detail_param.sort){
					parameters.sort_type = detail_param.sort;
				}
			}
			else{
				//直crooooberの場合
				parameters.q = detail_param.word; //encodeURIするべき？
				parameters.per_page = 50;

				if(detail_param.connector){
					parameters.connector = detail_param.connector;
				}
				if(detail_param.bunrui){
					parameters.c_bunrui_cd = detail_param.bunrui;
				}
				if(detail_param.kakaku_low){
					parameters.kakaku_low = detail_param.kakaku_low;
				}
				if(detail_param.kakaku_high){
					parameters.kakaku_high = detail_param.kakaku_high;
				}
				/*
				if(detail_param.sort){
					var sort = detail_param.sort;
					parameters.sort_type = ((sort == "1") ? "&arrival_date=desc" : ((sort == "2") ? "&kakaku=asc" : "&kakaku=desc") ) : "&arrival_date=desc";
				}
				*/

//"q=".$target_word."&per_page=".$length."&page=".$page."&c_bunrui_cd=".$bunrui."&connector=".$connector."&kakaku_low=".$price_low."&kakaku_high=".$price_upper.$sort;
			}
		}

		//sendRequest(url, parameters, 1, createResultItemsHeader);
		sendRequest(url, parameters, 1, callback);

		//現在の検索条件を保存する
		current_search_condition = parameters;
		
		if(detail_param){
			current_search_condition["is_detail_search"] = true;
		}

	}
	else{
		outLog("no search key...");
	}
}

/* 追加で商品一覧を取得する */
function getHeaderInfoMore(event, callback){

	if(event == null){
		event = document.getElementById("button_search_more");
	}

	var url = header_search_url;

	//現在までのトライ回数を取得する
	var try_num = event.getAttribute("try_num");

	//その時点までの検索条件を取得する
	var parameters = JSON.parse(event.getAttribute("search_condition"));

	if(parameters){
		parameters.page = Number(try_num) + 1; //次に読み込むページ番号

		//sendRequest(url, parameters, Number(try_num) + 1, createResultItemsHeader);
		sendRequest(url, parameters, Number(try_num) + 1, callback);
	}
	else{
		outLog("failure to get search condition...");
	}

}

/* Crooooberから商品明細を取得する */
//function getDetailInfo(event, callback){
function getDetailInfo(selected_item, callback, callback_for_cache){
	outLog("getDetailInfo Driven");

	var url = detail_search_url;

	var parameters = {
		//detail_path: event.getAttribute("datailurl")
		detail_path: selected_item.detail_url
	};

	var id = parameters.detail_path.split("/")[2];

	console.log("id is: " + id);
	console.log(parameters.detail_path);

	var detail_cache = storageManager.getDetailItem(id);
	var detail_cache_of_favorite = storageManager.getFavoriteItem(id);

	if(detail_cache){
			// 詳細ページに切り替え
			//$('body').pagecontainer('change', '#page_item_detail',　{ transition: 'slide' } );
			//myNavigator.pushPage("detail_content.htm", {});

			//キャッシュ向けのコールバック
			callback_for_cache(detail_cache);

	}
	else if(detail_cache_of_favorite && !detail_cache_of_favorite.flg_dont_have_detail){ //お気に入り情報にデータが存在する場合(ヘッダ情報だけなら破棄)
			callback_for_cache(detail_cache_of_favorite);
	}
	else{
		sendRequest(url, parameters, null, callback, function(){
			
			//前回表示が出るとまずい...
			//$("#detail_content_wrapper").empty();
			//とりあえず、持っている情報を出力しておく
			/*
			$("#detail_content_wrapper").html(template_item_detail({
				title: event.querySelector(".h_title").innerHTML,
				price: event.querySelector(".h_price").innerHTML
			}));
*/

			//ほんとはここでセットする！タイトルと価格！
			
			// 詳細ページに切り替え
			//$('body').pagecontainer('change', '#page_item_detail',　{ transition: 'slide' } );
			//myNavigator.pushPage("detail_content.html", {});

		});
	}

}

//詳細画面の削除ボタンを押下した場合
/*
function deleteCacheItem(e){

	var el_detail_title = document.getElementById("d_title");

	if(el_detail_title){
		var id = el_detail_title.getAttribute("detail_id");

		storageManager.deleteItem(id);
	}

}
*/

//ヘッダ一覧画面からお気に入りボタンを押した場合
function addFavoriteItemFromHeader(e){

	console.log("in addFavoriteItemFromHeader");

	e.stopPropagation();

	var el_target = e.target;

	try{
		//ださいけどparent parentする。面倒なんで
		var url = el_target.getAttribute("datailurl"); //li 要素のdetailUrlを取得

		console.log(url);

		var target_header_data = {};

		//現在表示中のヘッダリストから一致するデータを抽出して渡す
		for(var i = 0; i < current_header_items.length; i++){
			if(current_header_items[i].detail_url == url){
				target_header_data = current_header_items[i];
				break;
			}
		}

		storageManager.saveFavoriteItem2StorageWithUrl(target_header_data); //ヘッダ一覧からお気に入り保存用のメソッドコール

		$("#favorite_content_wrapper").html(template_favorite(storageManager.getAllFavoriteItemsAsArr()));

	}catch(e){
		console.log("error occured in addFavoriteItemFromHeader");
	}

}

function addFavoriteItemFromDetail(el_target){
	console.log("in addFavoriteItemFromDetail");

	try{
		var el_title = document.getElementById("d_title");

		if(el_title){

			var detail_info = storageManager.getDetailItem(el_title.getAttribute("detail_id"));

			if(detail_info){
				storageManager.saveFavoriteItem2StorageWithDetailData(detail_info);

				//$("#favorite_content_wrapper").html(template_favorite(storageManager.getAllFavoriteItemsAsArr()));
			}
			else{
				console.log("お気に入り登録に失敗しました(詳細情報取得失敗)")
			}

			//console.log("現在のお気に入り一覧:");
			//console.log(storageManager.getAllFavoriteItems());
		}

	}catch(e){
		console.log("error occured in addFavoriteItemFromDetail");
	}
}

//検索条件を保存する
function addSearchCondition(){
	storageManager.setSearchCondition(current_search_condition);
	alert_ex("検索条件を保存しました");

	$("#stored_search_condition_content_wrapper").html(template_search_condition(storageManager.getAllSearchConditionItemsAsArr()));
}

// 詳細検索ページの分類リストの可視性を制御する
//	画面ロード時、又は、ラジオボタン変更時に使用
function controlBunruiList(current_target){

	//分類選択リストのチェックを外す
	$("#search_condition_bunrui_list_wrapper > li").removeClass("bunrui_list_selected");
	$("#search_condition_bunrui_list_wrapper_car > li").removeClass("bunrui_list_selected");

   	if(current_target == "car"){
		document.getElementById("search_condition_bunrui_list_wrapper_car").style.display = "inline";
		document.getElementById("search_condition_bunrui_list_wrapper").style.display = "none";
	}
	else{
		document.getElementById("search_condition_bunrui_list_wrapper_car").style.display = "none";
		document.getElementById("search_condition_bunrui_list_wrapper").style.display = "inline";
	}
}

//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type, callback, before_callback){
	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	var str_parameters = convJSON2QueryString(parameters);

	//console.log("str_parameters is: " + str_parameters);

	if(is_debug){
		str_parameters = "";
	}

	console.log("url: " + url + str_parameters);

	$.ajax({
		//url: url + parameters,
		url: url + str_parameters,
		beforeSend: function(jqXHR){
			outLog("in beforeSend");
			
			if(before_callback){
				before_callback();
			}

			//$.mobile.loading('show');

			//dumpObject(jqXHR, 0);
		},
		success: function(data) {
			//outLog("in success. data is below:");
			//outLog(data);

			outLog("ajax success!!");
			
			callback(data, type, parameters);
			//createResult(data, type, parameters);

		},
		error: function(jqXHR, textStatus, errorThrown) {

			outLog("in error");

			alert("Error occured:" + textStatus);
			//dumpObject(jqXHR, 0);
		},
		complete: function(){

			outLog("in complete");

			//$.mobile.loading('hide');
		}
	});
}

