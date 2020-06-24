const {rooms} = require('./Room');
var io;
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
        iniciar: function(socket) {
            io=socket;
            loop();
        },
        detener: function() {
            clearTimeout(timer);
        }
    }

})();
module.exports= juego;