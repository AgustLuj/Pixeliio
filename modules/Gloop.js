/*const {rooms} = require('./Room');
var io;
var juego = (function() {
    var timer,
        velocidad = 1000;

    function actualizar() {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].play) {
                if (rooms[i].players.length > 0) {
                    if (rooms[i].timeMin <= 0 || rooms[i].timeSec <= 0) {
                        
                    }
                }
            }
        }
    }
    function loop() {
        actualizar();
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
module.exports= juego;*///Not Work 