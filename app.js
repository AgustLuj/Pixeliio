const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const infoPlayer = require('./modules/infoplayers.js');
const {Room} = require('./modules/Room.js');
const {rooms,cRoom} = require('./modules/cRoom');
const juego = require('./modules/Gloop.js');
var Cookies = require('cookies')
const path = require('path');

app.use(express.static('public'));
app.set('port', (process.env.PORT || 80));
/*************************************************/

var f = new Date();
cad = f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds();
var soc = true;
var numb = 0;
var words = [{'name':"rueda",'images':[]}];
const size = 32
var numbRoom = 0;
var wait_list = [];
var timers =3;
var info;
var jugadores = 18;
/*************************************************/
app.get('/',(req,res)=>{
    //var cookies = new Cookies(req, res, { keys: keys })
    //cookies.set('Pixeliio', new Date().toISOString(), { signed: true,sameSite:'none',secure:false })
    res.sendFile(path.join(__dirname+'/views/index.html'));
})
io.on('connection', function(socket) {
    
    if (soc) {

        socket.emit('nrecharge');
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
        if(socket.i == null || socket.j ==  null){
            infoPlayer({id,data2}, function(i, j) {
                socket.i = i;
                socket.j= j;
            })
            console.log(socket.i,socket.j)
        }
        try{
            rooms[socket.i].Changergb(socket.id,xy,{r,g,b});
            io.sockets.in(rooms[socket.i].name).emit('SPaint', id, rooms[socket.i].images[socket.j].player.name, xy, r, g, b);
        }catch(err){
            console.log(err)
        }
    });
    socket.on('vote', function(data) {
        try{
            rooms[socket.i].Svote(socket.id,data);
        }catch(err){
            console.log(err);
        }
        /*try{
            rooms[socket.i].vote(data,(done,max={})=>{
                if(done){
                    io.sockets.in(rooms[socket.i].name).emit('info',{'type':3,'players':rooms[socket.i].images,'win':max});
                }else{
                    rooms[socket.i].vote(data,(done,max={})=>{
                        if(done){
                            io.sockets.in(rooms[socket.i].name).emit('info',{'type':3,'players':rooms[socket.i].images,'win':max});
                        }
                    });
                }
            })
        }catch{} */
    });
    socket.on('finishe',function() {
            try{
                socket.leave(rooms[socket.i].name);
                socket.i=null;
                socket.j=null;
            }catch{}
            //io.sockets.in(rooms[i].name).emit('i',rooms[i].players);
    });
    socket.on('disconnect', function() {
        wait_list.forEach(({id},i)=>{
            if (id == socket.id) {
                if (wait_list.length == 1) clearTimeout(time);  timers = 59;
                wait_list.splice(i, 1);
            }
        })
        wait_list.forEach(({id}) =>{
            io.to(id).emit('info',{ 'type':1,'length':wait_list.length,'time':timers});
        })
    });
});

/*************************************************/
server.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'), cad);
});
function info() {
    wait_list.forEach(({id}) =>{
        io.to(id).emit('info',{ 'type':1,'length':wait_list.length,'time':timers});
    })
    if (timers <= 0) {
        if (wait_list.length > 1) {
            cRoom(io,numbRoom);
            Room(numbRoom,words,size,wait_list,io,function(data, words, data2) {
                numbRoom++;
                /*for (var i = 0; i < wait_list.length; i++){
                    io.to(wait_list[i].id).emit('join', data, words, wait_list[i].name, wait_list.length - jugadores);
                }*/
                wait_list.forEach(({id,name})=>{
                    io.to(id).emit('join', data, words,name, wait_list.length - jugadores);
                })
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