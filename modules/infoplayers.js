const {rooms} = require('./Room');
const info = ({id,data2}, fn) => {
    for (var i = 0; i < rooms.length; i++) {
        for (var j = 0; j < rooms[i].players.length; j++) {
            if (rooms[i].players[j].id == id && rooms[i].name == data2 && !rooms[i].finish) {
                fn(i, j);
                break;
            }
        }
    }
}
module.exports = info;
