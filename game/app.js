var express = require('express');
var app = express(); 
var server = require('http').Server(app);
var io = require('socket.io')(server);
var us = require('microseconds');
app.use(express.static('public'));

/*************************************************/
var f=new Date();
cad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();
var soc=true;
var numb=0;
setInterval(function(){ numb++ }, 1);
var a = 0;
/*************************************************/

io.on('connection',function(socket) {
	if(soc){
		io.emit('recharge');
		soc=false;
	}
	console.log("Se a conectado una persona "+socket.id);
	a=numb; 
	socket.emit('start')
	socket.on('getArray',function(data,fn) {
		var b = 0;
		b = numb;
		console.log(b-a,socket.id)
		fn(a,b,data.length);
	});
});
/*************************************************/
server.listen(8080,function() {
	console.log('El servidor esta corriendo en 8080 '+cad);

});