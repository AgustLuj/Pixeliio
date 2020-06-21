var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const fs = require('fs');
app.use(express.static('public'));

/*************************************************/
var f=new Date();
cad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();

var image;
var obj;

fs.readFile("file.json", 'utf8', function (err, data) {
  if (err) throw err;
  image = JSON.parse(data);
});

var soc=true;

/*************************************************/
io.on('connection',function(socket) {
		if(soc){
		io.emit('recharge');
		soc=false;
	}
	socket.on('room',function(data) {
		socket.join(data);
		io.sockets.in(data).emit('join',image);
	});
	socket.on('leave',function(data) {
		socket.leave(data);
	})
});

/*************************************************/
server.listen(8080,function() {
	console.log('El servidor esta corriendo en 8080 '+cad);

});
function save(data){
	var obj;
	fs.readFile("file.json", 'utf8', function (err, data) {
  		if (err) throw err;
 		obj = JSON.parse(data);
	});
	const content = JSON.stringify(data);
	const content3 = JSON.stringify(obj);
	const content2 = content3 + content;
	fs.writeFile("file.json", content2, 'utf8', function (err) {
    	if (err) {
        	return console.log(err);
    	}

    	console.log("The file was saved!");
	});
}
