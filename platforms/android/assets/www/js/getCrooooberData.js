var header_search_url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContents.php?";
var header_search_url_direct = "http://www.croooober.com/bparts/search?";
var detail_search_url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContentDetail.php?";
var detail_search_url_direct = "http://www.croooober.com";
var croooober_url = "http://www.croooober.com";

// 各種データ保存/取得用オブジェクト
var storageManager = new StorageManager();

//現在表示されている商品リストを保持しておく
var current_header_items = [];

//現在の検索条件保持用
var current_search_condition = {};

//検索トップのタイプ(0->通常, 1->jqでparse, 2->直croooober&jqでparse)    1は廃止...
var _debugging_type = "2";



/* onsenのロード完了！ */
/*
ons.ready(function() {
    // onsen ready 
    storageManager = new StorageManager();

    //pc実行か実機実行かで判定
    _debugging_type = (window.device) ? "2" : "0";

});
*/

/* 本来なら、ここでは
1. documentをget
2. parse
3. 各種値get
4. 値返却
まで。 ビューを変更するのはナンセンスすぎてわろし
*/
function createResultItemsHeader(data, type, parameters){ //type: 検索回数
	outLog("in createResultItemsHeader. _debugging_type is:" + _debugging_type); //ここまで来てる
	var got_html_document = null;

	try{
		var el_item_box = null;
		var search_result_num = null;
		var search_result_max_num = "-";

		if((_debugging_type != "1") && (_debugging_type != "2")){ //デフォルトルートの場合
			var dom_parser = new DOMParser();
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
			search_result_num = got_html_document.querySelector(".search_result_num");
			search_result_max_num = "-";
			
			if(search_result_num){

				//最大件数の取得
				search_result_max_num = search_result_num.querySelector("span").innerHTML;
				search_result_max_num = (search_result_max_num != null) ? search_result_max_num.replace(",", "") : "";
			}

			el_item_box = got_html_document.querySelectorAll(".item_box");
		}
		else{
			var dom = jQuery.parseHTML(data);

			el_item_box = $( ((_debugging_type == "2") ? ".crbr-search-result " : "") + ".item_box", dom); //firefoxデバッグ用の回避策

			console.log("in jQuery parse root. got item_box elements length is: " + el_item_box.length);

			var el_max_num_area = $(".crbr-sort > p > b", dom);
			search_result_max_num = (el_max_num_area && el_max_num_area.length && (el_max_num_area.length > 0)) ? el_max_num_area[0].innerHTML.replace(",", "") : "";
			//search_result_max_num = (search_result_max_num != "") ? search_result_max_num.replace(",", "") : "";
		}

		//取得した最大件数を保存
		document.getElementById("search_result_num").innerHTML = "ヒット件数：　" + search_result_max_num;//search_result_num.innerHTML;

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

		try{

			for(var i = 0; i < el_item_box.length; i++){
				var el = el_item_box[i];

				var el_feature = el.querySelector(".box_in > ul") ? el.querySelector(".box_in > ul") : el.querySelector(".item_cat");

				var title = el.querySelector("h3 > a") ? el.querySelector("h3 > a").innerHTML : el.querySelector("h4").innerHTML;
				var detail_url = el.querySelector("h3 > a") ? el.querySelector("h3 > a").getAttribute("href") : el.querySelector("a").getAttribute("href");
				var price = el.querySelector(".price span") ? el.querySelector(".price span").innerHTML : el.querySelector(".price_box > p").innerHTML;
				var is_newArrival = (el_feature && el_feature.querySelector(".i_li01,.cat01")) ? "h_newArrival_show" : "h_newArrival_hide";
				var is_new = (el_feature && el_feature.querySelector(".i_li02,.cat02")) ? "h_new_show" : "h_new_hide";
				var is_old = (el_feature && el_feature.querySelector(".i_li03,.cat03")) ? "h_old_show" : "h_old_hide";
				var is_junk = (el_feature && el_feature.querySelector(".i_li04,.cat04")) ? "h_junk_show" : "h_junk_hide";

				var data = {
					item_number: (i + 1) + previous_length,
					title: title,
					detail_url: detail_url,
					feature: el_feature,
					price: price,
					pic_url: el.querySelector("img").getAttribute("src").replace("//", "http://"),
					is_newArrival: is_newArrival,
					is_new: is_new,
					is_old: is_old,
					is_junk: is_junk
				};

				item_header_data[i] = data;
			}
		}
		catch(e){
			console.log("error occured on searching data from item_box. error message is following:");
			console.log(e.message);

			return []; //空を返却
		}

		//検索結果の商品一覧にデータをはめ込む
		var display_data;
		{
			if(type == 1){ 				
				//直前まで保存していた商品リストを破棄
				current_header_items = [];

			}

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
		//  ※これ、ホントはビューロジックなんでここに書いちゃいけないんだけどね...
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

//こっちは、取得データの返却なのでロジック的にok
function createResultItemDetail(data, type, parameters, optional_parameter){
	console.log("in createResultItemDetail!!");

	var dom_parser = new DOMParser();
	var got_html_document = null;

	try{

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
		}
		else{
			//jqパースの場合
			got_html_document = jQuery.parseHTML(data);
			//el_item_box = $(".crbr-search-result .item_box", dom);
		}

		var el = got_html_document;
		var id = parameters.__detail_url.split("/")[2];
		var url = parameters.__detail_url;
		var is_mobile = (_debugging_type == "2"); //2が通るということはスマホからしかあり得ないので

		console.log("is mobile page parsing?: " + is_mobile);

		var el_tbody = (!is_mobile) ? el.querySelectorAll(".riq01 .ta01 > tbody > tr") : jQuery(".detail_cont > .ta01 > tbody > tr", got_html_document);

		console.log("el_tbody length: " + el_tbody.length);

		var pictures = (function(el){
			var arr = [];

			var el_imges = (!is_mobile) ? el.querySelectorAll("#slideshow_thumb img") : jQuery("#thumb_cont img", got_html_document);

			for(var i = 0; i < el_imges.length; i++){
				arr[i] = el_imges[i].getAttribute("src").replace("//", "http://");
			}

			return arr;
		})(el);

console.log("star_box length: " + jQuery(".star_box", el_tbody).length);

		var title = (!is_mobile) ? el.querySelector("#title > .item_title").innerHTML : getJqInner(jQuery("#cont h2", got_html_document));
		var price = (!is_mobile) ? el.querySelector(".price_box > .price_in > .price").innerHTML : getJqInner(jQuery(".price > h5", got_html_document));
		var picture = pictures[0];
		var maker_name = (!is_mobile) ? el_tbody[0].querySelector("td > a").innerHTML : getJqInner(jQuery("td > a", el_tbody));
		var rank = "";
		try{
			rank = (!is_mobile) ? el_tbody[1].querySelector(".star_box").innerHTML : jQuery(".star_box", el_tbody)[0].getAttribute("class").replace(/star_box star0(.)/, "$1");
		}
		catch(e){
			console.log("failed to get rank...");
			console.log(e.message);
		}
		/* 2016/06/06 hide mod start */
		//var comment = (!is_mobile) ? el.querySelector(".riq01 .riq01_in > p > span").innerHTML : getJqInner(jQuery(".desc_cont > p", got_html_document));
		var comment = "";
		comment = (function(){

			var l_comment;

			l_comment = (!is_mobile) ? el.querySelector(".fix-reccomended").innerHTML : getJqInner(jQuery(".fix-reccomended", got_html_document));
			if(l_comment){
				console.log("comment element get ok.");
				return l_comment;
			}

			return (!is_mobile) ? el.querySelector(".riq01 .riq01_in > p > span").innerHTML : getJqInner(jQuery(".desc_cont > p", got_html_document));
		})();
		/* 2016/06/06 hide mod end */

		//必要箇所を抽出
		var data = {
			id: id,
			url: url,
			full_url: (croooober_url + url),
			title: title,
			price: price,
			pictures: pictures,
			picture: picture,
			maker_name: maker_name,
			rank: rank,
			//comment: el.querySelector(".riq01 .riq01_in > p").innerHTML,
			comment: comment,
			//tbody: el.querySelector(".riq01 .ta01 > tbody").innerHTML,
			ref_date_time: formatDate(new Date())
		};

		//今回取得した情報をlocalstorageに格納
		storageManager.saveDetailItem2Storage(data);

		return data; //詳細情報を返却する
	}
	catch(e){
		console.log(e.message);
	}

}

/******************************

保存した検索条件から検索の場合に、
車 / バイク のチェックボックスも保存しておかないといけない！！！！
	今は選択されているラジオボタンチェックの方で検索しちゃう

*******************************/
function getHeaderInfoFromStoredCondition(key){
	var param = storageManager.searchConditionHash[key];

	//保存した検索条件から の場合はフラグtrue
	param.is_from_stored_condition = true;

	getHeaderInfo(param);
}

function getHeaderInfo(detail_param, search_key, callback){

	var url = header_search_url; //ヘッダ検索用のURL
	var search_type = "bike"; //とりあえずデフォルトをセット 検索タイプ

	//var search_key = document.getElementById("search_key").value;

    if(_debugging_type == "2"){
    	url = header_search_url_direct;
    }

    outLog("before using storageManager.setSearchType");

    //保存した検索条件/純粋検索で分岐 ※※
	//if(detail_param && detail_param.is_from_stored_condition){
	if(detail_param){ //detail_paramが存在する->詳細検索か保存した条件からの場合
		//保存済の検索区分をセット
		search_type = detail_param.search_type;
	}
	else{
		//画面の検索区分をセット
		search_type = $('input[name=select_bike_or_car]:checked').val() || "bike";
		storageManager.setSearchType(search_type);
	}

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
				//直サーバの場合
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
				//直サーバの場合

				parameters.q = detail_param.word; //encodeURIするべき？
				parameters.per_page = 50;

				//2016/06/07 localeをセット
				parameters.locale = "ja";

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
				if(detail_param.sort){
					var sort = detail_param.sort;
					switch(sort){
						case "1":
							parameters.sort_type = "&arrival_date=desc";
							break;
						case "2":
							parameters.sort_type = "&kakaku=asc";
							break;
						case "3":
							parameters.sort_type = "&kakaku=desc";
							break;
						default:
							parameters.sort_type = "&arrival_date=desc";	
							break;
					}
					//parameters.sort_type = ((sort == "1") ? "&arrival_date=desc" : ((sort == "2") ? "&kakaku=asc" : "&kakaku=desc") ) : "&arrival_date=desc";
				}

//"q=".$target_word."&per_page=".$length."&page=".$page."&c_bunrui_cd=".$bunrui."&connector=".$connector."&kakaku_low=".$price_low."&kakaku_high=".$price_upper.$sort;
			}
		}

console.log("search_type is: " + search_type);

		//検索対象のurlを検索タイプによって切り替える
		if(search_type != "bike"){
			url = url.replace("bparts", "cparts");
		}

		//検索タイプをパラメータに隠しプロパティとしてセットしておく(さらに検索などで使用する)
		parameters.__search_type = search_type;

console.log("request url is: " + url);

		//ajaxリクエストを発行
		sendRequest(url, parameters, 1, callback);

		//現在の検索条件を保存する
		current_search_condition = parameters;
		
		if(detail_param){
			current_search_condition["is_detail_search"] = true;
		}

	}
	else{
		alert_ex("検索キーがありません");
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

	//スマホルートなら
    if(_debugging_type == "2"){
    	url = header_search_url_direct;

    	var search_type = parameters.__search_type;

    	//検索対象のurlを検索タイプによって切り替える
		if(search_type != "bike"){
			url = url.replace("bparts", "cparts");
		}
    }

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
		__detail_url: selected_item.detail_url
	}; //のちの処理で使用するので_付きでセット

    if(_debugging_type == "2"){
    	//直接読み込みの場合
    	url = detail_search_url_direct + selected_item.detail_url; //urlに商品idを付与するだけ
    }
    else{
		parameters["detail_path"] = selected_item.detail_url; //通常時の場合、パラメータを設定する
    }

	var id = selected_item.detail_url.split("/")[2];

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
		console.log("there is no cache data... send request to url");
		sendRequest(url, parameters, null, callback); //第5引数がコールバックへの任意パラメータ
	}

}


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
function sendRequest(url, parameters, type, callback){

	var str_parameters = convJSON2QueryString(parameters);

	console.log("url: " + url + str_parameters);

	$.ajax({
		//url: url + parameters,
		url: url + str_parameters,
		async: true,
		beforeSend: function(jqXHR){

			console.log("in beforeSend");
		},
		success: function(data) {
			//outLog("in success. data is below:");
			//outLog(data);

			console.log("ajax success!!");
			
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

