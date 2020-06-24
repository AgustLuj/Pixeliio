const Room = (numbRoom,words,rooms,size,wait_list,fn) => {
    let name = 'room-' + numbRoom;// numbRoom es el numero inicial de las room
    let numbRoom2 = numbRoom;
    numbRoom++;
    rooms.push({// incerto el nuevo romm en la variable general
        'name': name,
        'players': [],
        'timeMin': 0,
        'timeSec': 40,
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
module.exports = Room; 