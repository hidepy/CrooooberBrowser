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

	for(var prop in obj){
		outLog(depth_blank + prop + ":" + obj[prop]);

		if(typeof obj[prop] == "object"){
			dumpObject(obj[prop], depth + 1);
		}
	}
}
