//http://www.croooober.com/item/4041918

var template_item_headers;
var template_item_detail;

$(document).ready(function(){
	

	template_item_headers = Handlebars.compile($("#item_header_search_result").html());
	template_item_detail = Handlebars.compile($("#item_detail").html());

});

function createResultItemsHeader(data, type, parameters){ //type=1:トップのボタン, type=2:さらに読み込むボタン

	console.log("in createResultItemsHeader");

	var dom_parser = new DOMParser();
	var got_html_document = null;

	//var _data = "<html><head><title>test</title></head><body><p>no item</p></body></html>";

	//console.log(data);

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


		console.log(got_html_document.body);

		//検索結果の件数取得
		var dom_str = "";
		var search_result_num = got_html_document.querySelector(".search_result_num");
		if(search_result_num != null){
			dom_str = "<div id='search_result_num'>ヒット件数：" + search_result_num.querySelector("span").innerHTML + "件</div>";
		}

		/* 【この部分をHandlebar.jsで置き換え！】 */

		var el_item_box = got_html_document.querySelectorAll(".item_box");

		console.log(el_item_box);

		var item_header_data = {};
		item_header_data = [];

		for(var i = 0; i < el_item_box.length; i++){
			var el = el_item_box[i];

			var data = {
				title: el.querySelector("h3 > a").innerHTML,
				detail_url: el.querySelector("h3 > a").getAttribute("href"),
				feature: el.querySelector(".box_in > ul"), //以下にli有り
				price: el.querySelector(".price > span").innerHTML,
				pic_url: el.querySelector("img").getAttribute("src").replace("//", "http://")
			};

			item_header_data[i] = data;

		}

		//console.log(item_header_data);

		
		

		$("#contents_wrapper").empty();
		$("#contents_wrapper").html(template_item_headers(item_header_data));
		


		/*
		//次を読み込むボタンの作成
		switch(type){
			case 1:
				//最初のロード時
				document.getElementById("userlist").innerHTML = dom_str;
				break;	
			case 2:
				//2ページ目以降の場合
				document.getElementById("userlist").innerHTML += dom_str;
				break;
		}
		*/

		//document.getElementById("userlist").innerHTML += "<button class='ui-btn' onclick='button_clicked()'>さらに検索</button>";
	}
	catch(e){
		console.log(e)
	}
}

function createResultItemDetail(data){
	console.log("in createResultItemDetail!!");

	//必要情報の抜き出し
	/*
	title: #title > item_title
	pictures: #slideshow_thumb img
	tbody: .riq01 tbody
	comment: .riq01 p
	*/

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

		//必要箇所を抽出
		var data = {
			title: el.querySelector("#title > .item_title").innerHTML,
			pictures: el.querySelectorAll("#slideshow_thumb img"),
			tbody: el.querySelector(".riq01 tbody"),
			comment: el.querySelectorAll(".riq01 p")
		};

		//取得したデータを、Handlebars.jsで当てはめていく
		console.log(data);

		console.log($("#item_detail"));
		
		$("#detail_content_wrapper").empty();
		$("#detail_content_wrapper").html(template_item_detail(data));

		//全てが完了したら、ポップアップを開く
		$("#popup_item_detail").popup();
		$("#popup_item_detail").popup("open");

	}
	catch(e){
		console.log(e);
	}

}

/* Crooooberから商品ヘッダ一覧を取得する */
function getHeaderInfo(event){
	var url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContents.php?";
	//var url = "http://www.croooober.com/bparts/search?";
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
	console.log(event);

	var url = "http://www51.atpages.jp/hidork0222/croooober_client/getCrooooberContentDetail.php?";
	var parameters = "detail_path=" + event.getAttribute("datailurl");

	console.log("send request to url:" + parameters);
      
	sendRequest(url, parameters, null, createResultItemDetail);

}


var msg_no_searchKey = "検索キーが入力されていません";

function initialize() {};

//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type, callback){

	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	
	$.ajax({
		url: url + parameters,
		beforeSend: function(jqXHR){
			outLog("in beforeSend");

			//dumpObject(jqXHR, 0);
		},
		success: function(data) {

			console.log("ajax success!!");

			callback(data, type, parameters);
			//callback(data.responseText, type, parameters);
			//createResultItemsHeader(data, type, parameters);

		},
		error: function(jqXHR, textStatus, errorThrown) {

			outLog("in error");

			alert("Error:" + textStatus);
			dumpObject(jqXHR, 0);
		}
	});
	
}

