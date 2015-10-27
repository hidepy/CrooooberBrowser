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
	this.detailItemHash = this.convStorage2Hash(); //詳細ページの情報を保持するハッシュ

};

/* local storageからオブジェクトを生成 */
StorageManager.prototype.convStorage2Hash = function(){
	var item_hash = JSON.parse(window.localStorage.getItem("item_detail_info_list"));

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

	window.localStorage.setItem("item_detail_info_list", JSON.stringify(this.detailItemHash));

}

