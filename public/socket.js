var socket = io({'forceNew':true});
socket.on('recharge', function() {
    location.reload();
});
var count=0;
function socket_paint(id, xy, r, g, b) {
    socket.emit('paint', id, xy, r, g, b,room);
}
function socket_join(name) {
	socket.emit('joinRoom',name,function() {
		info({'type':"wait"});
	});
}
function socket_addVote(data) {
	socket.emit('vote',data,room);
}
function finish() {
	socket.emit('finishe',room);
}
socket.on('SPaint', function(id, name, xy, r, g, b) {
    paintOnline(id, name, xy, r, g, b);
});
socket.on('timer', function(min, sec) {
    setTime(min, sec);
});
socket.on('join',function(data,data2,name) {
	    socket.emit('login',data,function() {
	    	room = data;
	    	setRoom({'name':data,'words':data2});
			setId(socket.id,name);
	    });
});
socket.on('info',function({type,length,time,players,win}) {
	if(type == 1){
		info({'type':"wait",'users':length,'time':time});
	}else if(type == 2){
		info({'type':"finish"});
	}else if(type == 3){
		console.log(win,players)
		info({'type':"finish_votes",'images':players,'winner':win})
		
	}
});
socket.on('i',function() {
	console.log('Seguis en el room');
});