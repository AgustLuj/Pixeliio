var express = require('express');
var app = express(); 
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));

/*************************************************/

var f=new Date();
cad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();
var position=[];
var soc=true;

/*************************************************/

io.on('connection',function(socket) {
	if(soc){
		io.emit('recharge');
		soc=false;
	}
	
	console.log("Se a conectado una persona "+socket.id);

	socket.on('user',function(x,y,z) {
		socket.broadcast.emit('users',x,y,z);
	});
	socket.on('rotation',function(a) {
		socket.broadcast.emit('rotations',a,socket.id);
	});

})
/*************************************************/
server.listen(8080,function() {
	console.log('El servidor esta corriendo en 8080 '+cad);

});