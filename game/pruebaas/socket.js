var socket = io.connect({forceNew:true});

socket.on('recharge',function() {
	location.reload();
});

var room = "asd";

function enter() {
	socket.emit('room',room);
	console.log("Conectado al room: "+room);
}

function exit(){
	socket.emit('leave',room);
}

socket.on('join',function(data) {
	getImage(data)
});