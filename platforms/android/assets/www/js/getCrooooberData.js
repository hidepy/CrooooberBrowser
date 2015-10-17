var template_item_headers;
var template_item_detail;

$(document).ready(function(){
	

	template_item_headers = Handlebars.compile($("#item_header_search_result").html());
	template_item_detail = Handlebars.compile($("#item_detail").html());

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
				price: el.querySelector(".price").innerHTML,
				pic_url: el.querySelector("img").getAttribute("src").replace("//", "http://")
			};

			//dom_str += "<div onClick='getDetailInfo()' detailUrl='" + data.detail_url + "'>" + data.title + ": " + data.price + "<img src='" + data.pic_url + "'></div>";
			item_header_data[i] = data;
		}

		$("#contents_wrapper").empty();
		$("#contents_wrapper").html(template_item_headers(item_header_data));


		//次を読み込むボタンの作成
		/*
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
		//console.log(data);
		
		
		$("#detail_content_wrapper").empty();
		$("#detail_content_wrapper").html(template_item_detail(data));
		

		$("#open_dialog").trigger("click");

	}
	catch(e){
		console.log(e);
	}

}

var msg_no_searchKey = "検索キーが入力されていません";

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


		console.log("in getHeaderInfo");
		console.log(createResultItemsHeader);
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
      
	sendRequest(url, parameters, null, createResultItemDetail);

}


//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type, callback){

	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	console.log(callback);

	$.ajax({
		url: url + parameters,
		beforeSend: function(jqXHR){
			outLog("in beforeSend");

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
		}
	});
}
