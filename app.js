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
var words = ['rueda','raqueta','flor']; 
var rooms = [];
var numbRoom = 0;
var size = 32
var wait_list=[];
var time=setInterval(join, 5000);
/*************************************************/
io.on('connection', function(socket) {
    if (soc) {

        socket.emit('recharge');
        soc = false;
    }
    socket.on('login',function(data,fn) {
       socket.join(data);
       fn("joined");
    })
    socket.on('joinRoom',function(fn) {
        wait_list.push(socket.id);
        fn();
    })
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
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
function join() {
    if(wait_list.length >= 2){
            createRoom(function(data,words) {
                for (var i = 0; i < wait_list.length; i++) {
                    io.to(wait_list[i]).emit('join',data,words);
                }
                console.log(rooms);
            });
        wait_list=[];
    }
}
function createRoom(fn) {
    var name = 'room-' + numbRoom;
    var numbRoom2= numbRoom;
    numbRoom++;
    rooms.push({
        'name': name,
        'players': [],
        'timeMin': 1,
    	'timeSec': 59,
        'words':words[0]
    });
    for (var i = 0; i < wait_list.length; i++) {
        rooms[numbRoom2].players.push({
                'id': wait_list[i],
                'image': [{
                'size': size,
                'pixels': []
            }]
        });

        for (var q = 0; q < rooms[numbRoom2].players.length; q++) {
            if (rooms[numbRoom2].players[q].id == wait_list[i]) {
                for (var j = 0; j < size * size; j++) {
                    rooms[numbRoom2].players[q].image[0].pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
                }
            }
        }
    }
    fn(name,rooms[numbRoom2].words);
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