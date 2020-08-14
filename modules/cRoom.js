const rooms = []
var socket;
var io;
class Room{
    constructor(name){
        this.name = name;
        this.timeMin = 4;
        this.timeSec= 59;
        this.play = true;
        this.votes = 0;
        this.mVote=false;
        this.images = [];
        this.finish = false;
        this.timer;
        this.tim;
        this.tVote;
        this.velocidad =1000;
        this.a=true;
    }
    Svote(id,data){
        let i = this.images.findIndex(({player})=>player.id === id);
        if(!this.images[i].player.vote){
            this.images[i].player.vote = true;
            let j = this.images.findIndex(({player})=>player.id === data);
            this.images[j].votes++;
            this.votes++;
        }
    }
    createImg(size,id,name){
        this.images.push(new Image(size,id,name))
    }
    Changergb(socket,xy,{r,g,b}){
        let i = this.images.findIndex(({player})=>player.id === socket);
        this.images[i].change(xy,r,g,b);
    }
    actualizar(){
        if(this.play){
            if(this.images.length > 0){
                if(this.timeMin > 0 || this.timeSec > 0){
                    if(this.timeSec > 0){
                        this.timeSec--;
                    }else{
                        this.timeMin--;
                        this.timeSec = 59;
                    }
                }else if(this.play){
                    this.play = false;
                    io.sockets.in(this.name).emit('info',{'type':2});
                    this.mVote=true;
                    this.Ivotes();
                    this.detener();
                }
            }
        }
    }
    dibujar(){
        io.sockets.in(this.name).emit('timer', this.timeMin,this.timeSec);
    }
    loop(){
        this.actualizar();
        this.dibujar();
    }
    cVotes(){
        if (this.votes == this.images.length) {
            this.dVote();
            var max;
                this.images.forEach(imagen=>{
                    if(max == undefined || imagen.votes > max.votes){
                        max = imagen;
                    }
                })
            this.finish= true;
            console.log('a',this.tim,this.timer,this.tVote);
            if(this.a){
                io.sockets.in(this.name).emit('info',{'type':3,'players':this.images,'win':max});
                this.a = false;
            }
        }
    }
    Ivotes(){
        this.tVote = setInterval(()=>{this.cVotes()},500);
    }
    iniciar(){
        this.timer = setInterval(()=>{this.actualizar()},this.velocidad);
        this.tim = setInterval(()=>{this.dibujar()},100);
    }
    detener(){
        if (this.timer._repeat)
        {
            clearInterval(this.timer);
            
        }
        if (this.tim._repeat)
        {
            clearInterval(this.tim);
            
        }
        
    }
    dVote(){
        if (this.tVote._repeat)
        {
            clearInterval(this.tVote);
            
        }
        
    }
}
class Vote{
    vote(data){
        imagen = this.search(data)
        imagen.player.vote();
        this.votes++;
        imagen++;
        
    }
    search(data){
        return this.image.find(({player}) => player.name === data)
    }
}

class Player{
    constructor(id,name){
        this.id = id;
        this.name =name;
        this.vote = false;
    }
    vote(){
        this.vote = true;
    }
}
class Image{
    constructor(size,id,name){
        this.size = size;
        this.player = new Player(id,name);
        this.pixels = [];
        this.votes = 0;
        this.createPixels();
    }
    change(xy,r,g,b){
        this.pixels[xy].r = r;
        this.pixels[xy].g = g;
        this.pixels[xy].b = b;
    }
    createPixels(){
        for (let i = 0; i < this.size * this.size; i++) {
            this.pixels.push({ 'r': 255, 'g': 255, 'b': 255 });
        }
    }
}
const cRoom = (socket,numbRoom,id)=>{
    let name = 'room-' + numbRoom;
    io = socket;
    rooms.push(new Room(name,id))

}
module.exports={
    cRoom,
    rooms
}