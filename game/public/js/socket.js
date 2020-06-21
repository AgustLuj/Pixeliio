var socket = io.connect({'forceNew':true});

socket.on('recharge',function() {
	location.reload();
});
socket.on('start',function(data) {
	start();
});
function getArray(data) {
	socket.emit('getArray',data,function(a,b,c) {
		console.log(b-a,c,socket.id)
	});
}