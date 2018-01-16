var socket = io.connect({ forceNew: true });

socket.on('recharge', function() {
    location.reload();
});
function socket_paint(id, xy, r, g, b) {
    socket.emit('paint', id, xy, r, g, b);
}
function socket_join() {
	socket.emit('joinRoom',function() {
		info("wait");
	});
}
socket.on('SPaint', function(id, xy, r, g, b) {
    paintOnline(id, xy, r, g, b);
});
socket.on('timer', function(min, sec) {
    setTime(min, sec);
});
socket.on('join',function(data3,data2) {
	    socket.emit('login',data3,function(data) {
	    	setRoom({'name':data3,'words':data2});
        	setId(socket.id);
	    });
})