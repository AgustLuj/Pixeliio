const rooms = [];
var io;
var numbRoom = 0;
const Room = (numbRoom,words,size,wait_list,sock,fn) => {
    io=sock;
    let name = 'room-' + numbRoom;// numbRoom es el numero inicial de las room
    let numbRoom2 = numbRoom;
    numbRoom++;
    rooms.push({// incerto el nuevo romm en la variable general
        'name': name,
        'players': [],
        'timeMin': 0,
        'timeSec': 10,
        'words': words[0].name,
        'play': false,
        'votes': 0,
        'finish':false,
        'Gloop':(() =>{
            let id = numbRoom2; 
            var timer,
                velocidad = 1000;
        
            function actualizar() {
                let {play,players,timeMin,timeSec,name} = rooms[id];
                console.log('hola')
                if (play) {
                    if (players.length > 0) {
                        if (timeMin > 0 || timeSec > 0) {
                            if (timeSec > 0) {
                                rooms[id].timeSec--;
                            } else {
                                rooms[id].timeMin--;
                                rooms[id].timeSec = 59;
                            }
                        } else if (play) {
                            rooms[id].Gloop.detener();
                            play = false;
                            //save(rooms[id]);
                            io.sockets.in(name).emit('info',{'type':2});
                            //rooms.splice(i, 0);
                            //i -= 1;
                        }
                    }
                }
            }
        
            function dibujar() {
                    /*for (var j = 0; j < rooms[numbRoom2].players.length; j++) {
                        io.to(rooms[numbRoom2].players[j].id).emit('timer', timeMin,timeSec);
                    */
                    const {timeMin,timeSec,name} = rooms[numbRoom2];
                    io.sockets.in(name).emit('timer', timeMin,timeSec);
            }
            function loop() {
                actualizar();
                //dibujar();
                //stimer = setTimeout(loop, velocidad);
            }
            function print(){
                dibujar();
            }
        
            return {
                iniciar: function() {
                    timer=setInterval(loop, velocidad);
                    tim=setInterval(print, 100);
                },
                detener: function() {
                    clearInterval(timer)
                    clearInterval(tim)
                }
            }
        
        })(),
    });
    for (let i = 0; i < wait_list.length; i++) {
        rooms[numbRoom2].players.push({
            'id': wait_list[i].id,
            'name': wait_list[i].name,
            'image': [{
                'size': size,
                'pixels': [],
                'votes':0,
                'name':wait_list[i].name,
            }],
            'votes': 0
        });

        for (let q = 0; q < rooms[numbRoom2].players.length; q++) {
            if (rooms[numbRoom2].players[q].id == wait_list[i].id) {
                for (let j = 0; j < size * size; j++) {
                    rooms[numbRoom2].players[q].image[0].pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
                }
            }
        }
    }
    rooms[numbRoom2].Gloop.iniciar();
    fn(name, rooms[numbRoom2].words, numbRoom2);
}

const Changergb = (i,j,xy,{r,g,b})=>{
    rooms[i].players[j].image[0].pixels[xy].r = r;
    rooms[i].players[j].image[0].pixels[xy].g = g;
    rooms[i].players[j].image[0].pixels[xy].b = b;
}
const vote = (i,j,fn)=>{
    rooms[i].players[j].votes++;
    rooms[i].votes++;
    if (rooms[i].votes == rooms[i].players.length) {
        var max;
        for (let i = 0; i < rooms.length; i++) {
            for (let j = 0; j < rooms[i].players.length; j++) {
                if(max == undefined || rooms[i].players[j].votes > max.votes){
                    max = rooms[i].players[j];
                }
            }
        }
        fn(true,max)
        rooms[i].finish= true;
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
}
module.exports = {
    rooms,
    Room,
    Changergb,
    vote,
    numbRoom,
};