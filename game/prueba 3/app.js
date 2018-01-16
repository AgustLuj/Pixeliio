var express = require('express');
var app = express(); 
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));

/*************************************************/

var f=new Date();
cad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();
var person=[];
var soc=true;

/*************************************************/

io.on('connection',function(socket) {
	if(soc){
		io.emit('recharge');
		soc=false;
	}
	person.push({'id':socket.id,houses:['']})
	console.log("Se a conectado una persona "+socket.id);

	for (var i = person.length - 1; i >= 0; i--) {
		data = person[i].houses;
		for (var i = data.length - 1; i >= 0; i--) {
			if(data[i].x != undefined && data[i].y != undefined){
				socket.emit('allHouses',person[i].houses,person[i].id);
			}
		}
	}

	socket.on('createHouse',function(x,y) {

		for (var i = person.length - 1; i >= 0; i--) {
			if(person[i].id == socket.id){
				person[i].houses.push({'x':x,'y':y});
				socket.broadcast.emit('reciveHouse',x,y,person[i].id);
			}
		}
	})

})
/*************************************************/
server.listen(8080,function() {
	console.log('El servidor esta corriendo en 8080 '+cad);

});