const rooms = [];
const Room = (numbRoom,words,size,wait_list,fn) => {
    let name = 'room-' + numbRoom;// numbRoom es el numero inicial de las room
    let numbRoom2 = numbRoom;
    numbRoom++;
    rooms.push({// incerto el nuevo romm en la variable general
        'name': name,
        'players': [],
        'timeMin': 0,
        'timeSec': 20,
        'words': words[0].name,
        'play': false,
        'votes': 0,
        'finish':false
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
    fn(name, rooms[numbRoom2].words, numbRoom2);
}

const Changergb = (i,j,xy,{r,g,b})=>{
    rooms[i].players[j].image[0].pixels[xy].r = r;
    rooms[i].players[j].image[0].pixels[xy].g = g;
    rooms[i].players[j].image[0].pixels[xy].b = b;
}
const getRooms = ()=> console.log(`b:${rooms[i].players[j].image[0].pixels[xy].r}`);
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
    getRooms,
    vote
};