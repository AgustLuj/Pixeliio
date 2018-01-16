var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const fs = require('fs');
app.use(express.static('public'));

/*************************************************/

var f = new Date();
cad = f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds();
var soc = true;
var numb = 0;
var words = ['rueda','raqueta','flor']; 
var rooms = [{
    'name': 'room-0',
    'players': [],
    'timeMin': 5,
    'timeSec': 59,
    'words':words[0]
}];
var numbRoom = 0;
var size = 32

/*************************************************/
io.on('connection', function(socket) {
    if (soc) {

        socket.emit('recharge');
        soc = false;
    }
    var join = true
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].players.length < 10) {

            rooms[i].player++;
            socket.emit('joinRoom', rooms[i].name );
            socket.join(rooms[i].name);
            var join = false;
            break;
        }
        if (i == rooms.length - 1 && join) {
            createRoom();
            socket.emit('joinRoom', rooms[numbRoom].name);
            socket.join(rooms[numbRoom].name);
            var join = false;
            break;
        }

    }
    socket.on('login', function(room, fn) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].name == room) {

                fn(socket.id,rooms[i].words);

                rooms[i].players.push({
                    'id': socket.id,
                    'image': [{
                        'size': size,
                        'pixels': []
                    }]
                });

                for (var q = 0; q < rooms[i].players.length; q++) {
                    if (rooms[i].players[q].id == socket.id) {
                        for (var j = 0; j < size * size; j++) {

                            rooms[i].players[q].image[0].pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
                        }
                    }
                }
            }
        }
    });
    socket.on('paint', function(id, xy, r, g, b) {
        for (var i = 0; i < rooms.length; i++) {
            for (var j = 0; j < rooms[i].players.length; j++) {
                if (rooms[i].players[j].id == id) {

                    rooms[i].players[j].image[0].pixels[xy].r = r;
                    rooms[i].players[j].image[0].pixels[xy].g = g;
                    rooms[i].players[j].image[0].pixels[xy].b = b;
                    io.sockets.in(rooms[i].name).emit('SPaint', id, xy, r, g, b)
                }
            }
        }
    });
    socket.on('finish', function(data) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i] == data) {
                save(rooms[i]);
            }
        }
    })
});

/*************************************************/
server.listen(80, function() {
    console.log('El servidor esta corriendo en 80 ' + cad);

});

function createRoom() {
    numbRoom++;
    var name = 'room-' + numbRoom;
    rooms.push({
        'name': name,
        'players': [],
        'timeMin': 1,
    	'timeSec': 59
    });
    console.log(rooms);
}

function save(room) {
    var obj;
    fs.readFile("file.json", 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
    });
    const content = JSON.stringify(room);
    const content3 = JSON.stringify(obj);
    const content2 = content3 + content;
    fs.writeFile("file.json", content2, 'utf8', function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}
var juego = (function() {
    var timer,
        velocidad = 1000;

    function actualizar() {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].players.length > 0) {
                if (rooms[i].timeMin > 0 || rooms[i].timeSec > 0) {
                    if (rooms[i].timeSec > 0) {
                        rooms[i].timeSec--;
                    } else {
                        rooms[i].timeMin--;
                        rooms[i].timeSec = 59;
                    }
                } else {
                	
                }
            }
        }
    }

    function dibujar() {
        for (var i = 0; i < rooms.length; i++) {
            for (var j = 0; j < rooms[i].players.length; j++) {
                io.to(rooms[i].players[j].id).emit('timer', rooms[i].timeMin, rooms[i].timeSec);
            }
        }
    }

    function loop() {
        actualizar();
        dibujar();

        timer = setTimeout(loop, velocidad);
    }

    return {
        iniciar: function() {
            loop();
        },
        detener: function() {
            clearTimeout(timer);
        }
    }

})();

juego.iniciar();