/* ログを出力する */
function outLog(msg){
	console.log(msg);
	document.getElementById("contents_wrapper").innerHTML += msg + "<br>";
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