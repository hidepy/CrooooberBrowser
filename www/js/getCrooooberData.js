//http://www.croooober.com/item/4041918

function getDetailInfo(event){
	outLog("getDetailInfo Driven");
	console.log(event);

	var url = event.getAttribute("detailurl");

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

		/* 【この部分をHandlebar.jsで置き換え！】 */

		var el_item_box = got_html_document.querySelectorAll(".item_box");

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

			//dom_str += "<div onClick='getDetailInfo()' detailUrl='" + data.detail_url + "'>" + data.title + ": " + data.price + "<img src='" + data.pic_url + "'></div>";

			/*
			dom_str += "<li class='item_header_wrapper list-divider' onClick='getDetailInfo(this)' detailUrl='" + data.detail_url + "'>";
			dom_str += "<div class='item_header_text_info'>";
			dom_str += "<div>";
			dom_str += data.title;
			dom_str += "</div>";
			dom_str += "<div>";
			dom_str += data.price;
			dom_str += "</div>";
			dom_str += "</div>";
			dom_str += "<img src='" + data.pic_url + "'>";
			dom_str += "</li>";
			*/

		}

		console.log(item_header_data);

		var template_item_headers = Handlebars.compile($("#item_header_search_result").html());


		console.log("before set value");
		$("#contents_wrapper").html(template_item_headers(item_header_data));

		//$("#contents_wrapper").empty();
		//$("#contents_wrapper").html(template_item_headers(data));

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

var msg_no_searchKey = "検索キーが入力されていません";

function initialize() {};



//ajaxでリクエストを飛ばす
function sendRequest(url, parameters, type){

	//outLog("url:" + url + "/getCrooooberContents.php?" + parameters);

	//$.support.cors = true;
	//$.mobile.allowCrossDomainPages = true;

	$.ajax({
		//url: url + parameters,
		url: "debug_html.txt",
		beforeSend: function(jqXHR){
			outLog("in beforeSend");

			//dumpObject(jqXHR, 0);
		},
		success: function(data) {

			
			//console.log(data);

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

