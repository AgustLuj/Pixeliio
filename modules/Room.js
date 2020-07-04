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
        'timeMin': 1,
        'timeSec': 59,
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
    wait_list.forEach(({id,name}) => {
        rooms[numbRoom2].players.push({
            'id': id,
            'name': name,
            'image': [{
                'size': size,
                'pixels': [],
                'votes':0,
                'name':name,
            }],
            'votes': 0
        });
        rooms[numbRoom2].players.forEach((player)=>{
            if (player.id == id) {
                for (let j = 0; j < size * size; j++) {
                    player.image[0].pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
                }
            }
        })
    });
    rooms[numbRoom2].Gloop.iniciar();
    fn(name, rooms[numbRoom2].words, numbRoom2);
}

const Changergb = (i,j,xy,{r,g,b})=>{
    rooms[i].players[j].image[0].pixels[xy].r = r;
    rooms[i].players[j].image[0].pixels[xy].g = g;
    rooms[i].players[j].image[0].pixels[xy].b = b;
}
const vote = (data,fn)=>{
    let Ri=null;
    let Pj=null;
    rooms.forEach(({players},i)=>{
        players.forEach(({id},j)=>{
            if(data == id){
                rooms[i].players[j].votes++;
                rooms[i].votes++;
                Ri=i;
                Pj=j;
            }
        })
    })
    if (rooms[Ri].votes == rooms[Ri].players.length) {
        var max;
        rooms.forEach(room=>{
            room.players.forEach(player=>{
                if(max == undefined || player.votes > max.votes){
                    max = player;
                }
            })
        })
        fn(true,max)
        rooms[Ri].finish= true;
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