var socket = io.connect({ forceNew: true });

socket.on('recharge', function() {
    location.reload();
});
socket.on('joinRoom', function(data2) {
    socket.emit('login', data2, function(data,data3) {
        setRoom({'name':data2,'words':data3});
        setId(data);

    });
});

function socket_paint(id, xy, r, g, b) {
    socket.emit('paint', id, xy, r, g, b);
}
socket.on('SPaint', function(id, xy, r, g, b) {
    paintOnline(id, xy, r, g, b);
});
socket.on('timer', function(min, sec) {
    setTime(min, sec);
});
