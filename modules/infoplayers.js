//const {rooms} = require('./Room');
const {rooms} = require('./cRoom');
/*const info = ({id,data2}, fn) => {
    for (var i = 0; i < rooms.length; i++) {
        for (var j = 0; j < rooms[i].players.length; j++) {
            if (rooms[i].players[j].id == id && rooms[i].name == data2 && !rooms[i].finish) {
                fn(i, j);
                break;
            }
        }
    }
}*/
const info = ({id,data2},fn)=>{
    let i = rooms.findIndex(({name})=>name === data2);
    let j = rooms[i].images.findIndex(({player})=>player.id === id);
    fn(i,j);
}
module.exports = info;
