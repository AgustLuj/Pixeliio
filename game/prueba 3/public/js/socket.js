var socket = io.connect({'forceNew':true});
var sid= [];
socket.on('connect', function(){sid.push(socket.id)});

socket.on('recharge',function() {
	location.reload();
});
function createHouse(x,y) {
	socket.emit('createHouse',x,y)
}
socket.on('reciveHouse',function(x,y,id) {
	getHouse(x,y,id);
})
socket.on('allHouses',function(data,id) {
	for (var i = data.length - 1; i >= 0; i--) {
		getHouse(data[i].x,data[i].y,id);
	}
})