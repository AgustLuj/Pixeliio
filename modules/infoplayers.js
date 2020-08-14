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
const infoPlayer = ({id,data2},fn)=>{
    let i = rooms.findIndex(({name})=>name === data2);
    let j = rooms[i].images.findIndex(({player})=>player.id === id);
    let name = rooms[i].name;
    fn(i,j,name);
}
const Pjinfo = (id,fn)=>{
    rooms.forEach(({images,name},i)=>{
        let j = images.findIndex(({player})=>player.id === id);
        return {i,j,name};
    })
}
module.exports = {
    infoPlayer,
    Pjinfo
};
