/* from 
url: 	http://keicode.com/
author:	Keisuke Oyama
 */

function Queue(h) {
	this.__a = new Array();

	if(h){
		this.convHash2Queue(h);
	}
}

Queue.prototype.enqueue = function(o) {
	this.__a.push(o);
}

Queue.prototype.dequeue = function() {
	if( this.__a.length > 0 )
	{
		return this.__a.shift(); 
	}
	return null;
}

Queue.prototype.size = function() {
	return this.__a.length;
}

/* extension */
Queue.prototype.convHash2Queue = function(h){

	for(var prop in h){
		this.enqueue(h[prop]);
	}
}