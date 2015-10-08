
function outLog(msg){
	console.log(msg);
	document.getElementById("contents_wrapper").innerHTML += msg + "<br>";
}

function getDetailInfo(event){
	var url = event.target.getAttribute("datailUrl");

	console.log("send request to url:" + url);

}


function createResult(data, type, parameters){ //type=1:トップのボタン, type=2:さらに読み込むボタン
	console.log("in createResult");
	//outLog(data); //ここまで来てる

	var dom_parser = new DOMParser();
	var got_html_document = null;

	//var _data = "<html><head><title>test</title></head><body><p>no item</p></body></html>";

	try{
		got_html_document = dom_parser.parseFromString(data, "text/html");

		if(got_html_document == null){
			outLog("got_html_document is null...");

			/*
			got_html_document = (function(data){
				var doc = document.implementation.ceateHTMLDocument("");
				doc.body.innerHTML = data;
				return doc;
			})(data);

			outLog("after creating document forcely:");
			//outLog(got_html_document);
			*/

			return false;
		}
		

		//parseに失敗した場合...
		if(got_html_document.getElementsByTagName("parsererror").length > 0){
			got_html_document = null;
		}

		//outLog("got_html_document is:");
		//outLog(got_html_document);



		//検索結果の件数取得
		var dom_str = "";
		var search_result_num = got_html_document.querySelector(".search_result_num");
		{
			dom_str = "<div id='search_result_num'>ヒット件数：" + search_result_num.querySelector("span").innerHTML + "件</div>";
		}


		var el_item_box = got_html_document.querySelectorAll(".item_box");

		//console.log(el_item_box);

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

			dom_str += "<div class='item_header_wrapper' onClick='getDetailInfo()' detailUrl='" + data.detail_url + "'>";
			dom_str += "<div class='item_header_text_info'>";
			dom_str += "<div>";
			dom_str += data.title;
			dom_str += "</div>";
			dom_str += "<div>";
			dom_str += data.price;
			dom_str += "</div>";
			dom_str += "</div>";
			dom_str += "<img src='" + data.pic_url + "'>";
			dom_str += "</div>";

		}



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

		//document.getElementById("userlist").innerHTML += "<button class='ui-btn' onclick='button_clicked()'>さらに検索</button>";
	}
	catch(e){
		console.log(e)
	}
}

var msg_no_searchKey = "検索キーが入力されていません";

function initialize() {};

function dumpObject(obj, depth){
	var depth_blank = "";
	for(var i = 0; i < depth; i++){
		depth_blank += " ";
	}

	for(var prop in obj){
		outLog(depth_blank + prop + ":" + obj[prop]);

		if(typeof obj[prop] == "object"){
			dumpObject(obj[prop], depth + 1);
		}
	}
}

//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type){

	//outLog("url:" + url + "/getCrooooberContents.php?" + parameters);

	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	$.ajax({
		//url: url + "/users/getTestData.php?word=vtr250",
		//url: "http://kizasi.jp/kizapi.py?type=rank",
		url: url + parameters,
		//url: "users/getTestData.php",
		//type: "GET",
		//dataType: "json",
		beforeSend: function(jqXHR){
			outLog("in beforeSend");

			//dumpObject(jqXHR, 0);
		},
		success: function(data) {
			//outLog("in success. data is below:");
			//outLog(data);


			/*
			outLog("ajax success!!");
			outLog("is this flow through??");
			*/
			createResult(data, type, parameters);

		},
		error: function(jqXHR, textStatus, errorThrown) {
			/*
			document.getElementById("userlist").innerHTML += "jqXHR:" + jqXHR.status + "<br>" + "errorThrown:" + errorThrown.message;
			alert("Error:" + textStatus);
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
			*/

			outLog("in error");

			alert("Error:" + textStatus);
			dumpObject(jqXHR, 0);
		}
	});
}

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