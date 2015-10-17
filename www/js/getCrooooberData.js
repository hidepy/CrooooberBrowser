var template_item_headers;
var template_item_detail;

var header_search_url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContents.php?";

$(document).ready(function(){
	
	/* handlebars.js 用 */
	template_item_headers = Handlebars.compile($("#item_header_search_result").html());
	template_item_detail = Handlebars.compile($("#item_detail").html());


	/* 格納された */

});


function createResultItemsHeader(data, type, parameters){ //type=1:トップのボタン, type=2:さらに読み込むボタン
	console.log("in createResult");
	//outLog(data); //ここまで来てる

	var dom_parser = new DOMParser();
	var got_html_document = null;

	//var _data = "<html><head><title>test</title></head><body><p>no item</p></body></html>";

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


		//検索結果の件数取得
		var dom_str = "";
		var search_result_num = got_html_document.querySelector(".search_result_num");
		{
			dom_str = "<div id='search_result_num'>ヒット件数：" + search_result_num.querySelector("span").innerHTML + "件</div>";
		}


		var el_item_box = got_html_document.querySelectorAll(".item_box");

		var item_header_data = {};
		item_header_data = [];

		for(var i = 0; i < el_item_box.length; i++){
			var el = el_item_box[i];

			var data = {
				title: el.querySelector("h3 > a").innerHTML,
				detail_url: el.querySelector("h3 > a").getAttribute("href"),
				feature: el.querySelector(".box_in > ul"), //以下にli有り
				price: el.querySelector(".price span").innerHTML,
				pic_url: el.querySelector("img").getAttribute("src").replace("//", "http://")
			};

			//dom_str += "<div onClick='getDetailInfo()' detailUrl='" + data.detail_url + "'>" + data.title + ": " + data.price + "<img src='" + data.pic_url + "'></div>";
			item_header_data[i] = data;
		}

		$("#contents_wrapper").empty();
		$("#contents_wrapper").html(template_item_headers(item_header_data));


		//次を読み込むボタンの作成
		switch(type){
			case 1:
				//最初のロード時
				
				break;	
			case 2:
				//2ページ目以降の場合
				
				break;
		}

		//document.getElementById("userlist").innerHTML += "<button class='ui-btn' onclick='button_clicked()'>さらに検索</button>";
	}
	catch(e){
		console.log(e)
	}
}


function createResultItemDetail(data, type, parameters){
	console.log("in createResultItemDetail!!");

	var dom_parser = new DOMParser();
	var got_html_document = null;

	//var _data = "<html><head><title>test</title></head><body><p>no item</p></body></html>";

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

		var id = parameters.split("/")[2];
		var url = parameters.split("=")[1];
		var pictures = (function(el){
			var arr = [];

			var el_imges = el.querySelectorAll("#slideshow_thumb img");

			for(var i = 0; i < el_imges.length; i++){
				arr[i] = el_imges[i].getAttribute("src").replace("//", "http://");
			}

			return arr;
		})(el);

		//console.log(url);

		//console.log(pictures);

		//必要箇所を抽出
		var data = {
			id: id,
			url: url,
			title: el.querySelector("#title > .item_title").innerHTML,
			price: el.querySelector(".price_box > .price_in > .price").innerHTML,
			pictures: pictures,
			picture: el.querySelector("#slideshow_thumb img").getAttribute("src").replace("//", "http://"),
			maker_name: el_tbody[0].querySelector("td > a").innerHTML,
			rank: el_tbody[1].querySelector(".star_box").innerHTML,
			comment: el.querySelector(".riq01 .riq01_in > p").innerHTML,
			tbody: el.querySelector(".riq01 .ta01 > tbody").innerHTML,
			ref_date_time: formatDate(new Date())
		};

		//取得したデータを、Handlebars.jsで当てはめていく
		//console.log(data);
		
		//今回取得した情報をlocalstorageに格納

		$("#detail_content_wrapper").html(template_item_detail(data));

	}
	catch(e){
		console.log(e);
	}

}

var msg_no_searchKey = "検索キーが入力されていません";

function getHeaderInfo(event){
	var url = header_search_url; //ヘッダ検索用のURL

	var search_key = document.getElementById("search_key").value;

	if((search_key != null) && (search_key != "")){

		var parameters = "";
		{
			parameters += "word=" + encodeURIComponent(search_key);
			parameters += "&length=50";
		}

		sendRequest(url, parameters, 1, createResultItemsHeader);
	}
	else{
		outLog("no search key...");
	}
}

/* Crooooberから商品明細を取得する */
function getDetailInfo(event){
	outLog("getDetailInfo Driven");

	var url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContentDetail.php?";
	var parameters = "detail_path=" + event.getAttribute("datailurl");

	sendRequest(url, parameters, null, createResultItemDetail, function(){
		
		
		//前回表示が出るとまずい...
		$("#detail_content_wrapper").empty();
		//とりあえず、持っている情報を出力しておく
		$("#detail_content_wrapper").html(template_item_detail({
			title: event.querySelector(".h_title").innerHTML,
			price: event.querySelector(".h_price").innerHTML
		}));
		

		// 詳細ページに切り替え
		$('body').pagecontainer('change', '#page_item_detail',　{ transition: 'slide' } );

	});

}

//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type, callback, before_callback){

	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	$.ajax({
		url: url + parameters,
		beforeSend: function(jqXHR){
			outLog("in beforeSend");

			
			if(before_callback){
				before_callback();
			}

			$.mobile.loading('show');

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

			alert("Error:" + textStatus);
			dumpObject(jqXHR, 0);
		},
		complete: function(){

			outLog("in complete");

			$.mobile.loading('hide');
		}
	});
}

function saveDetailItem2Storage(data){
	//処理時間を考慮し、追加時は特に件数チェックは行わない


	var item_hash = JSON.parse(window.localStorage.getItem("item_detail_info_list"));

	if(!item_hash){
		item_hash = {};
	}


	//このハッシュは、itemのidをキーとして、dataオブジェクトが格納されている
	/*
	{
		271236: {
			id
			url
			title...
		},
		212896: {
			id
			url
			title...
		}
		...
	}
	*/

	item_hash[data.id] = JSON.stringify(data);



}