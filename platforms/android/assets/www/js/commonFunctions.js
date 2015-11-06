/* ログを出力する */
function outLog(msg){
	if((typeof msg) == "object"){
		console.log("(is object...)");
	}
	else{
		console.log(msg);
	}
	
	//document.getElementById("contents_wrapper").innerHTML += msg + "<br>";
}


/* オブジェクトの中身を画面に出力する */
function dumpObject(obj, depth){
	var depth_blank = "";
	for(var i = 0; i < depth; i++){
		depth_blank += " ";
	}

	if(depth > 3){
		return;
	}

	for(var prop in obj){
		outLog(depth_blank + prop + ":" + obj[prop]);

		if(typeof obj[prop] == "object"){
			dumpObject(obj[prop], depth + 1);
		}
	}
}

/* 時間を文字列に変換 */
function formatDate(date){
	return ("" + date.getFullYear() + ("00" + (date.getMonth() + 1)).slice(-2) + ("00" + date.getDate()).slice(-2) + ("00" + date.getHours()).slice(-2) + ("00" + date.getMinutes()).slice(-2) + ("00" + date.getSeconds()).slice(-2) );
}

/* JSONをクエリリクエストストリングに変換 */
function convJSON2QueryString(data){
	var result = "";

	for(var prop in data){
		result += "" + prop + "=" + data[prop] + "&";
	}

	console.log("in convJSON2QueryString, result is: " + result);

	return result;

}

/* ハッシュを配列に変換する */
function convHash2Arr(hash){

	var arr = [];

	for(var prop in hash){
		arr.push(hash[prop]);
	}

	return arr;
}

/* 配列をハッシュに変換する. キーとするプロパティ名が必要 */
function convArr2Hash(list, key){

	var hash = {};

	if(list == null){
		return hash;
	}

	for(var i = 0; i < list.length; i++){
		hash[list[i][key]] = list[i];
	}

	return hash;

}

