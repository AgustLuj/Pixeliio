const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const {infoPlayer,Pjinfo} = require('./modules/infoplayers.js');
//const {Room} = require('./modules/Room.js');
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
var timers =59;
var info;
var jugadores = 18;
let loop = false;
let timIniciar=false;
let timeIniciar;
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
        wait_list.push({ 'id': socket.id, 'name': name ,'play':false});
        if(wait_list.length >= 2 && null !== timIniciar){
            clearTimeout(timeIniciar)
            timeIniciar = setTimeout(()=>{
                timIniciar = true;
                //console.log('hola')
            },100000);
        }
        if(!loop){
            whiteList.iniciar();
        }
    });
    socket.on('paint', function(id, xy, r, g, b,data2) {
        if(socket.i == null || socket.j ==  null){
            //console.log(data2)
            infoPlayer({id,data2}, function(i, j,name) {
                socket.name = name
                socket.i = i;
                socket.j = j;
            })
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
            Pjinfo(socket.id, ({i, j,name}) => {
                socket.name = name
                socket.i = i;
                socket.j = j;
                //console.log(socket.i,socket.j) 
            })
            rooms[socket.i].Svote(socket.id,data);
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
                socket.name = null;
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
    
}
let a = true;
var whiteList = (function() {
    var timer,tim,
        velocidad = 1000;

    function actualizar() {
        if (timers <= 0 || timIniciar) {
            timIniciar=false;
            if (wait_list.length > 1) {
                if(a){
                    let a = false
                    detener();
                    cRoom(io,numbRoom,(idRoom,nameRoom)=>{
                        rooms[idRoom].play = true;
                        wait_list.forEach(({id,name},i) => {
                            if(i<17){
                                rooms[idRoom].createImg(size,id,name);
                                wait_list[i].play = true;
                            }
                        });
                        rooms[idRoom].play = true;
                        rooms[idRoom].iniciar();          
                        numbRoom++; 
                        wait_list.forEach(({id,name,play},i)=>{
                            if(play){
                                io.to(id).emit('join', nameRoom, 'rueda',name, wait_list.length - jugadores);
                            }
                            
                        })
                        
                    });
                    if(wait_list >17){
                        wait_list.forEach(({play},i)=>{
                            if(play){
                                wait_list.splice(i,1);
                            }
                        })
                    }else{
                        wait_list = [];
                    }
                    timers = 59
                    a = true;
                    loop = false;
                }
            } else {
                timers = 59;
            }
        } else {
            timers -= 1;
        }
    }
    function dibujar(){
        wait_list.forEach(({id}) =>{
            io.to(id).emit('info',{ 'type':1,'length':wait_list.length,'time':timers});
        })
    }
    const detener = ()=> {
        if (timer._repeat){
            clearTimeout(timer);
            clearTimeout(tim);
            loop = false;
        }
    }
    return {
        iniciar: function() {
            if(!loop){
                loop = true;
                timer = setInterval(()=>{actualizar()},velocidad);
                tim = setInterval(()=>{dibujar()},100);    
            }
                   
        },
        detener: function() {
            if (timer._repeat)
            {
                loop = false;
                clearTimeout(timer);
                clearTimeout(tim);
            } 
        }
    }

})();

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