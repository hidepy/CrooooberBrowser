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

var StorageManager = function(){

	console.log("StorageManager initialize start");

	this.cacheName = "item_detail_info_list"; //キャッシュ情報
	this.favorName = "favorite_list"; //お気に入り情報
	this.searchTypeName = "search_type"; //バイク検索or車検索
	this.searchConditionName = "search_condition"; //検索条件情報

	this.searchType = this.getSearchType(); //バイク用品検索か, 車用品検索か　true->bike, false->car

	this.detailItemHash = this.convStorage2Hash(); //詳細ページの情報を保持するハッシュ
	this.favoriteItemHash = this.convStorage2FavoriteItemHash(); //お気に入りのロード
	this.searchConditionHash = this.getSearchCondition(); //検索条件のロード

	this.limit = 100; //商品詳細の最大保持件数
	this.limitItems(); //保持件数に制限をかける

	console.log("StorageManager initialize end");

};

/* 検索タイプ(バイクor車)の取得/保存 */
StorageManager.prototype.getSearchType = function(){

	var type;

	try{
		type = window.localStorage.getItem(this.searchTypeName);

		if(type == null){
			type = "bike";
			this.setSearchType(type);
		}
	}
	catch(e){
		console.log("getSearchType failed...");

		type = "bike";
		this.setSearchType(type);
	}

	return type;
}
StorageManager.prototype.setSearchType = function(val){
	
	console.log("in setSearchType");

	this.searchType = val;

	window.localStorage.setItem(this.searchTypeName, val);

}

/* 検索条件の取得/保存 */
StorageManager.prototype.getSearchCondition = function(){
	console.log("in getSearchCondition");

	var cond_hash = JSON.parse(window.localStorage.getItem(this.searchConditionName));

	if(!cond_hash){
		cond_hash = {};
	}

	return cond_hash;
}
StorageManager.prototype.setSearchCondition = function(param){
	console.log("in setSearchCondition");

	var key = param.word;

	this.searchConditionHash[key] = param;

	window.localStorage.setItem(this.searchConditionName, JSON.stringify(this.searchConditionHash));

	alert_ex("現在の検索条件を保存しました");
}
StorageManager.prototype.getAllSearchConditionItemsAsArr = function(){
	return convHash2Arr(this.searchConditionHash);
}
//複数削除機能
//	id_arrは配列の想定
StorageManager.prototype.deleteSearchConditionItems = function(id_arr){

	for(var i = 0; i < id_arr.length; i++){
		delete　this.searchConditionHash[id_arr[i]];
	}

	//ストレージにセット
	window.localStorage.setItem(this.searchConditionName, JSON.stringify(this.searchConditionHash));

	alert_ex("検索条件を削除しました");

}


/* local storageからオブジェクトを生成 */
StorageManager.prototype.convStorage2Hash = function(){
	var item_hash = JSON.parse(window.localStorage.getItem(this.cacheName));

	if(!item_hash){
		item_hash = {};
	}

	return item_hash;
}

StorageManager.prototype.getAllItem = function(){
	return this.detailItemHash;
}

/* ハッシュに格納されている商品詳細情報を取得する */
StorageManager.prototype.getDetailItem = function(key){
	return this.detailItemHash[key];
}

/* ハッシュに格納されている商品情報を削除する */
StorageManager.prototype.deleteCacheItem = function(key){

	//ハッシュから削除
	delete　this.detailItemHash[key];

	//ストレージにセット
	window.localStorage.setItem(this.cacheName, JSON.stringify(this.detailItemHash));

	alert_ex("キャッシュを削除しました");
}

/* 商品情報1件をハッシュに保存 */
StorageManager.prototype.saveDetailItem2Storage = function(data){
	//処理時間を考慮し、追加時は特に件数チェックは行わない

	console.log("in saveDetailItem2Storage");

	this.detailItemHash[data.id] = data;

	window.localStorage.setItem(this.cacheName, JSON.stringify(this.detailItemHash));

}

/* 商品情報の件数に制限をかける */
StorageManager.prototype.limitItems = function(){

	console.log("in limitItems");

	var arr = convHash2Arr(this.detailItemHash);

	if(arr.length <= this.limit){
		return; //制限件数に達していなければ終了
	}

	console.log("item detail cache over " + this.limit + ". delete old cache");

	arr.sort(function(a, b){
		return (a.ref_date_time < b.ref_date_time) ? -1 : ((a.ref_date_time > b.ref_date_time) ? 1 : 0);
	});

	//ハッシュをクリア
	this.detailItemHash = {};

	//最大保存数分ハッシュに追加
	for(var i = 0; i < this.limit; i++){
		this.detailItemHash[arr[i].id] = arr[i];
	}

	//localStorageを同期
	window.localStorage.setItem(this.cacheName, JSON.stringify(this.detailItemHash));

}




//-------------------- お気に入り関連 --------------------
StorageManager.prototype.convStorage2FavoriteItemHash = function(){

	var item_hash = {};
	try{
		item_hash = JSON.parse(window.localStorage.getItem(this.favorName));

		if(item_hash == null){
			item_hash = {};
		}

		console.log("load favorite item success!!");
	}catch(e){
		item_hash = {};

		console.log("load favorite item error...");
	}

	return item_hash;
}

//単一のお気に入り情報を取得する
StorageManager.prototype.getFavoriteItem = function(key){
	return this.favoriteItemHash[key];
}

StorageManager.prototype.getAllFavoriteItems = function(){
	return this.favoriteItemHash;
}

StorageManager.prototype.getAllFavoriteItemsAsArr = function(){
	return convHash2Arr(this.favoriteItemHash);
}

//ヘッダ一覧画面でお気に入りを押した場合
// 後の修正が大変なので、フローは1本化するべきか？
StorageManager.prototype.saveFavoriteItem2StorageWithUrl = function(header_data){
	
	var id = header_data.detail_url.split("/")[2];

	// 既に登録済か確認
	if(this.favoriteItemHash[id]){
		return;
	}

	this.favoriteItemHash[id] = {
		id: id,
		url: header_data.detail_url,
		full_url: "none...",
		title: header_data.title,
		price: header_data.price,
		pictures: "",
		picture: header_data.pic_url,
		maker_name: "",
		rank: "",
		comment: "no comment...",
		tbody: "",
		ref_date_time: formatDate(new Date()),
		flg_dont_have_detail: true
	}; //flgが立っている = 詳細情報を検索していない

	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));

	alert_ex("お気に入りに登録しました！");

	console.log("set detailinfo to favorite(url)");
}

StorageManager.prototype.saveFavoriteItem2StorageWithDetailData = function(data){

	console.log("in saveFavoriteItem2StorageWithDetailData");

	this.favoriteItemHash[data.id] = data;

	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));

	alert_ex("お気に入りに登録しました！");

	console.log("set detailinfo to favorite(detail)");
}

//複数削除機能
//	id_arrは配列の想定
StorageManager.prototype.deleteItems = function(id_arr){

	for(var i = 0; i < id_arr.length; i++){
		delete　this.favoriteItemHash[id_arr[i]];
	}

	//ストレージにセット
	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));

	alert_ex("お気に入りを削除しました");

}
//単一削除機能
StorageManager.prototype.deleteItem = function(key){

	//現在のお気に入りから削除
	delete　this.favoriteItemHash[key];

	//ストレージにセット
	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));

	alert_ex("お気に入りを削除しました");
}

/*
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
			comment: el.querySelector(".riq01 .riq01_in > p").innerHTML,
			tbody: el.querySelector(".riq01 .ta01 > tbody").innerHTML,
			ref_date_time: formatDate(new Date())
		};
*/


