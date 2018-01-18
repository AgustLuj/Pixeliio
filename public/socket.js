var socket = io.connect({ forceNew: true });

socket.on('recharge', function() {
    location.reload();
});
function socket_paint(id, xy, r, g, b) {
    socket.emit('paint', id, xy, r, g, b);
}
function socket_join(name) {
	socket.emit('joinRoom',name,function() {
		info({'type':"wait"});
	});
}
socket.on('SPaint', function(id, xy, r, g, b) {
    paintOnline(id, xy, r, g, b);
});
socket.on('timer', function(min, sec) {
    setTime(min, sec);
});
socket.on('join',function(data3,data2,name) {
	    socket.emit('login',data3,function(data) {
	    	setRoom({'name':data3,'words':data2});
        	setId(socket.id);
	    });
})
socket.on('info',function(length,time) {
	info({'type':"wait",'users':length,'time':time})
})