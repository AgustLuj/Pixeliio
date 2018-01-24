var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const fs = require('fs');
app.use(express.static('public'));
app.set('port', (process.env.PORT || 80));
/*************************************************/

var f = new Date();
cad = f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds();
var soc = true;
var numb = 0;
var words = ['rueda', 'raqueta', 'flor'];
var rooms = [];
var numbRoom = 0;
var size = 32
var wait_list = [];
var timers = 5;
var info;
var jugadores = 18;
/*************************************************/
io.on('connection', function(socket) {
    if (soc) {

        socket.emit('recharge');
        soc = false;
    }
    socket.on('login', function(data, fn) {
        socket.join(data);
        fn("joined");
    })
    socket.on('joinRoom', function(name, fn) {
        wait_list.push({ 'id': socket.id, 'name': name });
        if (wait_list.length < 2 && wait_list.length > 0) {
            time = setInterval(info, 1000)
        }
        fn();
    })
    socket.on('paint', function(id, xy, r, g, b) {
        for (var i = 0; i < rooms.length; i++) {
            for (var j = 0; j < rooms[i].players.length; j++) {
                if (rooms[i].players[j].id == id) {

                    rooms[i].players[j].image[0].pixels[xy].r = r;
                    rooms[i].players[j].image[0].pixels[xy].g = g;
                    rooms[i].players[j].image[0].pixels[xy].b = b;
                    io.sockets.in(rooms[i].name).emit('SPaint', id, rooms[i].players[j].name, xy, r, g, b)
                }
            }
        }
    });
    socket.on('disconnect', function() {
        for (var i = 0; i < wait_list.length; i++) {
            if (wait_list[i].id == socket.id) {
                if (wait_list.length == 1) {
                    clearTimeout(time);
                    timers = 59;

                }
                wait_list.splice(i, 1);
            }
        }
        for (var i = 0; i < wait_list.length; i++) {
            io.to(wait_list[i].id).emit('info', wait_list.length, timers);
        }
    })
});

/*************************************************/
server.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'), cad);
});

function join() {

    if (wait_list.length < jugadores - 1) { //ACÁ CAMBIÉ PARA QUE, CON UN SOLO USUARIO, CREE UNA ROOM <----
        createRoom(function(data, words, data2) {
            for (var i = 0; i < wait_list.length; i++) {
                io.to(wait_list[i].id).emit('join', data, words, wait_list[i].name, wait_list.length - jugadores);
            }
            rooms[data2].play = true;
        });
        wait_list = [];
        clearTimeout(time);
        timers = 59
    }
}

function createRoom(fn) {
    var name = 'room-' + numbRoom;
    var numbRoom2 = numbRoom;
    numbRoom++;
    rooms.push({
        'name': name,
        'players': [],
        'timeMin': 2,
        'timeSec': 60,
        'words': words[0],
        'play': false
    });
    for (var i = 0; i < wait_list.length; i++) {
        rooms[numbRoom2].players.push({
            'id': wait_list[i].id,
            'name': wait_list[i].name,
            'image': [{
                'size': size,
                'pixels': []
            }]
        });

        for (var q = 0; q < rooms[numbRoom2].players.length; q++) {
            if (rooms[numbRoom2].players[q].id == wait_list[i].id) {
                for (var j = 0; j < size * size; j++) {
                    rooms[numbRoom2].players[q].image[0].pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
                }
            }
        }
    }
    fn(name, rooms[numbRoom2].words, numbRoom2);
}

function info() {
    for (var i = 0; i < wait_list.length; i++) {
        io.to(wait_list[i].id).emit('info', wait_list.length, timers);
    }
    if (timers <= 0) {
        if (wait_list.length > 1 ) {
            createRoom(function(data, words, data2) {
                for (var i = 0; i < wait_list.length; i++) {
                    io.to(wait_list[i].id).emit('join', data, words, wait_list[i].name, wait_list.length - jugadores);
                }
                rooms[data2].play = true;
            });
            wait_list = [];
            clearTimeout(time);
            timers = 59
        }else{
            timers = 59;
        }
    } else {
        timers -= 1;
    }
}

function save(room) {
    var obj;
    fs.readFile("file.json", 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);

    });
    obj.rooms.push(room);
    const content3 = JSON.stringify(obj);
    fs.writeFile("file.json", content3, 'utf8', function(err) {
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
            if (rooms[i].play) {
                if (rooms[i].players.length > 0) {
                    if (rooms[i].timeMin > 0 || rooms[i].timeSec > 0) {
                        if (rooms[i].timeSec > 0) {
                            rooms[i].timeSec--;
                        } else {
                            rooms[i].timeMin--;
                            rooms[i].timeSec = 59;
                        }
                    } else if (rooms[i].play) {
                        rooms[i].play = false;
                        //save(rooms[i]);
                        io.sockets.in(rooms[i].name).emit('finish');
                        //rooms.splice(i, 0);
                        //i -= 1;
                    }
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