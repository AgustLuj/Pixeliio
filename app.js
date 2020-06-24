const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const infoPlayer = require('./modules/infoplayers.js');
const createRoom = require('./modules/Room.js');
app.use(express.static('public'));
app.set('port', (process.env.PORT || 80));
/*************************************************/

var f = new Date();
cad = f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds();
var soc = true;
var numb = 0;
var words = [{'name':"rueda",'images':[]}];
var rooms = [];
var numbRoom = 0;
const size = 32
var wait_list = [];
var timers = 10;
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
        fn();
    })
    socket.on('joinRoom', function(name, fn) {
        wait_list.push({ 'id': socket.id, 'name': name });
        if (wait_list.length < 2 && wait_list.length > 0) {
            time = setInterval(info, 1000)
        }
        fn();
    });
    socket.on('paint', function(id, xy, r, g, b,data2) {
       infoPlayer(id,data2,rooms, function(i, j) {
            rooms[i].players[j].image[0].pixels[xy].r = r;
            rooms[i].players[j].image[0].pixels[xy].g = g;
            rooms[i].players[j].image[0].pixels[xy].b = b;
            
            io.sockets.in(rooms[i].name).emit('SPaint', id, rooms[i].players[j].name, xy, r, g, b);
        });
    });
    socket.on('vote', function(data,data2) {
        infoPlayer(data,data2,rooms, function(q, g) {
            rooms[q].players[g].votes++;
            rooms[q].votes++;
            if (rooms[q].votes == rooms[q].players.length) {
                var max;
                for (var i = 0; i < rooms.length; i++) {
                    for (var j = 0; j < rooms[i].players.length; j++) {
                        if(max == undefined || rooms[i].players[j].votes > max.votes){
                            max = rooms[i].players[j];
                        }
                    }
                }
                io.sockets.in(rooms[q].name).emit('info',{'type':3,'players':rooms[q].players,'win':max});
                rooms[q].finish= true;
               /* for (var i = 0; i < words.length; i++) {
                    if(room[q].words == words[i].name){
                        for (var j = 0; j < rooms[q].players.length; j++) {
                            if(rooms[q].players[j].votes > 0){
                                words[i].images.push(rooms[q].players[j].image);
                            }
                        }
                    }
                }*/
                
            }
        });
    });
    socket.on('finishe',function(data) {
        infoPlayer(socket.id,data,rooms, function (i,j) {
            socket.leave(rooms[i].name);
            //io.sockets.in(rooms[i].name).emit('i',rooms[i].players);
        })
    })
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
            io.to(wait_list[i].id).emit('info',{ 'type':1,'length':wait_list.length,'time':timers});
        }
    });
});

/*************************************************/
server.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'), cad);
});
/*function join() {

    if (wait_list.length < jugadores - 1) {
        createRoom(function(data, words, data2) {
            for (var i = 0; i < wait_list.length; i++) {
                io.to(wait_list[i].id).emit('join', data, words, wait_list[i].name);
            }
            rooms[data2].play = true;
        });
        wait_list = [];
        clearTimeout(time);
        timers = 59
    }
}
*/
function info() {
    for (let i = 0; i < wait_list.length; i++) {
        io.to(wait_list[i].id).emit('info',{ 'type':1,'length':wait_list.length,'time':timers});
    }
    if (timers <= 0) {
        if (wait_list.length > 1) {
            createRoom(numbRoom,words,rooms,size,wait_list,function(data, words, data2) {
                for (var i = 0; i < wait_list.length; i++) {
                    io.to(wait_list[i].id).emit('join', data, words, wait_list[i].name, wait_list.length - jugadores);
                }
                rooms[data2].play = true;
            });
            wait_list = [];
            clearTimeout(time);
            timers = 59
        } else {
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
                        io.sockets.in(rooms[i].name).emit('info',{'type':2});
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
                const {timeMin,timeSec} = rooms[i]
                io.to(rooms[i].players[j].id).emit('timer', timeMin,timeSec);
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