var socket = io.connect({'forceNew':true});
socket.on('recharge',function() {
	location.reload();
});
function user(x,y) {
	socket.emit('user',x,y);
	draw(x,y);
}
socket.on('users',function(x,y) {
	draw(x,y);
})
function erase(id) {
	socket.emit('delete',id);
}
socket.on('destroy',function(id) {
	destroy(id);
})