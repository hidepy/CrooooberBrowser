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
	this.cacheName = "item_detail_info_list";
	this.favorName = "favorite_list";

	this.detailItemHash = this.convStorage2Hash(); //詳細ページの情報を保持するハッシュ
	this.favoriteItemHash = this.convStorage2FavoriteItemHash(); //お気に入りのロード

	this.limit = 100; //商品詳細の最大保持件数
	this.limitItems(); //保持件数に制限をかける

};

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
StorageManager.prototype.deleteItem = function(key){

	//ハッシュから削除
	delete　this.detailItemHash[key];

	//ストレージにセット
	window.localStorage.setItem(JSON.stringify(this.detailItemHash));
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
	}catch(e){
		item_hash = {};
		//window.localStorage.setItem(this.favorName, JSON.stringify({}));

	}

	return item_hash;
}

StorageManager.prototype.getAllFavoriteItems = function(){
	return this.favoriteItemHash;
}

//ヘッダ一覧画面でお気に入りを押した場合
// 後の修正が大変なので、フローは1本化するべきか？
StorageManager.prototype.saveFavoriteItem2StorageWithUrl = function(detail_url){
	
	console.log("in saveFavoriteItem2StorageWithUrl");

	var id = detail_url.split("/")[2];

	// 既に登録済か確認
	if(this.favoriteItemHash[id]){
		return;
	}

	this.favoriteItemHash[id] = {
		id: id,
		flg_dont_have_detail: true
	}; //flgが立っている = 詳細情報を検索していない

	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));
}

StorageManager.prototype.saveFavoriteItem2StorageWithDetailData = function(data){

	this.favoriteItemHash[data.id] = data;

	window.localStorage.setItem(this.favorName, JSON.stringify(this.favoriteItemHash));
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


