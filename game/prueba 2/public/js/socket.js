var socket = io.connect({'forceNew':true});
socket.on('recharge',function() {
	location.reload();
});
function user(x,y,z) {
	socket.emit('user',x,y,z);
}
function rotation(a) {
	socket.emit('rotation',a);
}
socket.on('users',function(x,y,z) {
	draw(x,y,z);
	
});
socket.on('rotations',function(a,id) {
		draw2(a,id);
});
