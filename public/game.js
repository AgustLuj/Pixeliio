const canvas = document.getElementById("canvas")
var app = new PIXI.Application({width:1000,height:700,view: canvas,});
//document.body.appendChild(app.view);
document.body.addEventListener('keydown',e => onkeydown(e));

app.ticker.add(delta => gameLoop(delta));

/*****************************************************************/

var ID = -999;
var USERNAME = "anonimo";

var USERS = 0;

var SCREEN = 0; //0 = menu,1 = game,2 = wait,3 = finish,4 = winner

var WIDTH = 1000;
var HEIGHT = 700;

var room = "none";
var word = "none_";

var winner;

var voted = false; 

var mx = -99;
var my = -99;

var click = false;

var SCALE = 12;

var oldx = -9;
var oldy = -9;

var R = 200;
var G = 0; 
var B = 0;

var turquoise = "0x1abc9c";
var alizarin = "0xe74c3c";
var midblue = "0x2c3e50";
var clouds = "0xecf0f1";
var greensea = "0x11856e";

/*****************************************************************/

var tex_back = PIXI.Texture.fromImage("res/point.png");
var tex_palette = PIXI.Texture.fromImage("res/palette.png");

var tex_pencil = PIXI.Texture.fromImage("res/lapiz.png");
var tex_brush = PIXI.Texture.fromImage("res/pincel.png");
var tex_fill = PIXI.Texture.fromImage("res/balde.png");
var tex_erase = PIXI.Texture.fromImage("res/goma.png");


var back = new PIXI.Sprite(tex_back);
back.width = 1000;
back.height = 700;
back.tint = midblue;

app.stage.interactive = true;

app.stage.addChild(back);

/*****************************************************************/

var InputBox = function(x,y,w,size,color){

	this.y = y;

	this.w = w;
	this.h;

	if(x == "CENTER"){this.x = (WIDTH - this.w) / 2;}else {this.x = x;}

	this.click = false;
	this.selected = false;

	this.color = color;
	this.str = "";
	this.info = "Nombre";

	this.text = new Text(this.str,this.x,this.y,size);

	this.h = this.text.text.height + 20;

	this.text.set(this.x + (this.w - this.text.text.width) / 2,this.y + (this.h - this.text.text.height) / 2);

	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(2,getColor(255,255,255),1);
	this.graphics.drawRoundedRect(this.x,this.y,this.w,this.h,10);
	this.graphics.tint = greensea;

	app.stage.addChild(this.graphics);
	this.text.add();

	this.setText = function(txt){

		this.text.setText(txt);

		if(this.text.text.width > this.w - 10){
			this.text.setText(this.str);
		}else {
			this.str = txt;
			this.text.set(this.x + (this.w - this.text.text.width) / 2,this.y + (this.h - this.text.text.height) / 2);
		}
	}

	this.tick = function(){

		if(this.click){
			this.selected = true;
			this.click = false;
		}

		if(this.selected){

			this.graphics.tint = turquoise;
			this.text.text.alpha = 1;

		}else {
			this.graphics.tint = greensea;
			this.text.text.alpha = 0.5;
		}

		if(this.str == ""){
			this.text.setText(this.info);
			this.text.set(this.x + 10,this.y + (this.h - this.text.text.height) / 2);
			this.text.text.alpha = 0.5;
		}
	}
}

var Text = function(str,x,y,size){

	this.str = str;

	if(x == "CENTER"){this.x = 0;}else {this.x = x;}

	this.y = y;

	this.size = size;

	this.style = new PIXI.TextStyle({
		fontFamily: 'Arial',
	    fontSize: this.size,
	    fontWeight: 'bold',
	    dropShadow: true,
    	dropShadowColor: getColorRGBA(0,0,0,120),
    	dropShadowBlur: 10,
    	dropShadowDistance: 2,
	    fill: [getColor(255,255,255,255)], 
	});

	this.text = new PIXI.Text(this.str,this.style);
	this.text.x = this.x;
	this.text.y = this.y;

	this.set = function(x,y){

		this.x = x;
		this.y = y;

		this.text.x = x;
		this.text.y = y;
	}

	if(x == "CENTER"){this.set((WIDTH - this.text.width) / 2,this.y);}

	this.setText = function(str){
		this.text.text = str;
	}

	this.add = function(){
		app.stage.addChild(this.text);
	}

}

var Button = function(x,y,w,str,size,color){

	this.w = w;
	this.h;

	this.y = y;

	if(x == "CENTER"){this.x = (WIDTH - this.w) / 2;}else {this.x = x;}

	this.click = false;
	this.hover = false;
	this.old_click = false;
	this.delayclick = false;

	this.color = color;
	this.str = str;

	this.text = new Text(this.str,this.x,this.y,size);

	if(this.text.text.width + 50 > this.w){
		this.w = this.text.text.width + 50;
	}

	this.h = this.text.text.height + 18;

	this.text.set(this.x + (this.w - this.text.text.width) / 2,this.y + (this.h - this.text.text.height) / 2);

	this.graphics = new PIXI.Graphics();
	this.graphics.beginFill(getColor(255,255,255),1);
	this.graphics.drawRoundedRect(this.x,this.y,this.w,this.h,15);
	this.graphics.tint = turquoise;
	this.graphics.endFill();

	app.stage.addChild(this.graphics);
	this.text.add();

	this.tick = function(){

		if(this.click){
			this.graphics.tint = greensea;
			this.old_click = this.click;
		}else {	

			this.delayclick = false;

			if(this.old_click){
				this.delayclick = true;
				this.old_click = false;
			}

			if (!this.hover){

				this.graphics.tint = turquoise;
				this.graphics.alpha = 1;

			}else{
				if(this.graphics.alpha > 0.8){this.graphics.alpha -= 0.025;}
			}	
		}
	}
}

var ImageButton = function(x,y,w,h,color,texture){

	this.w = w;
	this.h = h;

	this.y = y;

	if(x == "CENTER"){this.x = (WIDTH - this.w) / 2;}else {this.x = x;}

	this.click = false;
	this.hover = false;
	this.old_click = false;
	this.delayclick = false;

	this.canselect = false;
	this.selected = false;

	this.switched = false;
	this.canswitch = false;

	this.color = color;

	this.graphics = new PIXI.Graphics();
	this.graphics.beginFill(getColor(255,255,255),1);
	this.graphics.drawRoundedRect(this.x,this.y,this.w,this.h,15);
	this.graphics.tint = turquoise;
	this.graphics.endFill();

	this.sprite = new PIXI.Sprite(texture);

	this.sprite.width = this.w - 10;
	this.sprite.height = this.h - 10;

	this.sprite.x = this.x + 5;
	this.sprite.y = this.y + 5;

	app.stage.addChild(this.graphics);
	app.stage.addChild(this.sprite);

	this.tick = function(){

		if(this.click){
			this.graphics.tint = greensea;
			this.old_click = this.click;
		}else {	

			this.delayclick = false;

			if(this.old_click){

				this.delayclick = true;
				this.old_click = false;

				if(this.canselect){
					this.selected = !this.selected;
				}
			}

			if (!this.hover){

				this.graphics.tint = turquoise;
				this.graphics.alpha = 1;

			}else{
				if(this.graphics.alpha > 0.8){this.graphics.alpha -= 0.025;}
			}	
		}
	}
}

var Image = function(size,offx,offy,scale,pix){

	this.size = size;
	this.pixels = [];

	this.offx = offx;
	this.offy = offy;
	this.scale = scale;

	this.id = -9;
	this.name = "?";

	this.count = 0;

	if(pix == null){

		for(var i = 0;i < this.size * this.size;i++){
			this.pixels.push({'r' : 255,'g' : 255,'b' : 255});
		}

	}else {
		this.pixels = pix;
	}

	this.graphics = [];

	for(var i = 0;i < this.size * this.size;i++){

		this.graphics.push(new PIXI.Graphics());

		var g = this.graphics[this.graphics.length - 1];

		g.beginFill(getColor(this.pixels[i].r,this.pixels[i].g,this.pixels[i].b),1);
		g.lineStyle(0,0x000000);
		g.drawRect(offx + getX(i,this.size) * scale,offy + getY(i,this.size) * scale,scale,scale);
		g.endFill();

		app.stage.addChild(this.graphics[this.graphics.length - 1]);
	}

	this.paint = function(x,y,r,g,b){

		if(x >= 0 && x < this.size && y >= 0 && y < this.size){

			var xy = getXY(x,y,this.size);

			this.pixels[xy].r = r;
			this.pixels[xy].g = g;
			this.pixels[xy].b = b;

			this.graphics[xy].tint = getColor(r,g,b);
	
		}
	}

	this.paintXY = function(xy,r,g,b){

		this.pixels[xy].r = r;
		this.pixels[xy].g = g;
		this.pixels[xy].b = b;

		this.graphics[xy].tint = getColor(r,g,b);
	}

	this.socket_paint = function(x,y,r,g,b){

		if(x >= 0 && y >= 0 && x < this.size && y < this.size){

			var xy = getXY(x,y,this.size);
			socket_paint(ID,xy,Math.trunc(r),Math.trunc(g),Math.trunc(b));
		}
	}

	this.getPixel = function(x,y){

		var xx = Math.trunc((x - this.offx) / SCALE);
		var yy = Math.trunc((y - this.offy) / SCALE);

		if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size){

			var xy = getXY(xx,yy,this.size);
			var c = {'r':this.pixels[xy].r,'g':this.pixels[xy].g,'b':this.pixels[xy].b};
			return c;
		}
	}

	this.getPixelAt = function(x,y){

		if(x >= 0 && x < this.size && y >= 0 && y < this.size){

			var c = {'r':this.pixels[getXY(x,y,this.size)].r,'g':this.pixels[getXY(x,y,this.size)].g,'b':this.pixels[getXY(x,y,this.size)].b};
			return c;
		}
	}
}

var VImage = function(size){

	this.size = size;
	this.pixels = [];

	this.offx = 0;
	this.offy = 0;

	for(var i = 0;i < this.size * this.size;i++){
		this.pixels.push({'r' : 255,'g' : 255,'b' : 255});
	}

	this.paint = function(x,y,r,g,b){

		var xy = getXY(x,y,this.size);

		this.pixels[xy].r = r;
		this.pixels[xy].g = g;
		this.pixels[xy].b = b;
	}

	this.paintXY = function(xy,r,g,b){

		this.pixels[xy].r = r;
		this.pixels[xy].g = g;
		this.pixels[xy].b = b;
	}

	this.getPixel = function(x,y){

		var xx = Math.trunc(x - this.offx);
		var yy = Math.trunc(y - this.offy);

		if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size){

			var xy = getXY(xx,yy,this.size);
			return this.pixels[xy];
		}
	}

	this.getPixelAt = function(x,y){

		if(x >= 0 && x < this.size && y >= 0 && y < this.size){
			return this.pixels[getXY(x,y,this.size)];
		}
	}
}

var Palette = function(x,y){

	this.x = x;
	this.y = y;

	this.image = new VImage(255);

	this.image.offx = this.x;
	this.image.offy = this.y;

	this.img_palette = new PIXI.Sprite(tex_palette);

	this.img_palette.width = 256;
	this.img_palette.height = 256;
	this.img_palette.x = this.x;
	this.img_palette.y = this.y;

	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(1,getColor(255,255,255),1);
	this.graphics.drawRect(this.x - 2,this.y - 2,259,259);

	app.stage.addChild(this.img_palette);
	app.stage.addChild(this.graphics);
}

var ColorPicker = function(){

	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(3,getColor(255,255,255),1);
	this.graphics.drawCircle(0,0,21);

	this.graphics2 = new PIXI.Graphics();
	this.graphics2.beginFill(getColor(255,255,255),1);
	this.graphics2.drawCircle(0,0,20);
	this.graphics2.endFill();

	app.stage.addChild(this.graphics);
	app.stage.addChild(this.graphics2);

	this.setPos = function(x,y){

		this.graphics.x = x;
		this.graphics.y = y;

		this.graphics2.x = x;
		this.graphics2.y = y;
	}

	this.show = function(bool){

		this.graphics.visible = bool;
		this.graphics2.visible = bool;
	}

	this.setColor = function(r,g,b){
		this.graphics2.tint = getColor(r,g,b);
	}
}

var ColorRadius = function(){

	this.x = 0;
	this.y = 0;
	this.r = 20;

	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(1,getColor(0,0,0),1);
	this.graphics.drawCircle(0,0,this.r);

	app.stage.addChild(this.graphics);

	this.setPos = function(x,y){

		if(this.x != x || this.y != y){

			this.x = x;
			this.y = y;

			this.graphics.x = x;
			this.graphics.y = y;
		}
	}

	this.show = function(bool){
		this.graphics.visible = bool;
	}

	this.setSize = function(size){

		if(this.r != size){

			this.r = size;

			this.graphics.clear();
			this.graphics.lineStyle(1,getColor(0,0,0),1);
			this.graphics.drawCircle(0,0,this.r);
		}
	}
}

var Charge = function(x,y){

	this.x = x;
	this.y = y;

	this.f = 1;
	this.mode = 0;

	this.graphics = new PIXI.Graphics();
	app.stage.addChild(this.graphics);

	this.tick = function(){

		this.timer++;

		this.graphics.clear();
		this.graphics.lineStyle(4,alizarin,1);
		this.graphics.arc(this.x,this.y,30,(Math.PI * 2) * (this.f - 0.4),(Math.PI * 2) * this.f);

		if(this.mode == 0){
			if(this.f > 0.02){this.f -= 0.02;}else {this.mode = 1;}
		}else if(this.mode == 1){
			if(this.f < 1){this.f += 0.02;}else {this.mode = 0;}
		}
		
	}
}

var Slider = function(x,y,w){

	this.x = x;
	this.y = y;

	this.w = w;
	this.h = 40;

	this.f = 0;

	this.click = false;

	this.graphics_bar = new PIXI.Graphics();
	this.graphics_bar.beginFill(getColor(255,255,255),1);
	this.graphics_bar.drawRoundedRect(this.x,this.y + 14,this.w,7,5);
	this.graphics_bar.endFill();

	this.graphics_circle = new PIXI.Graphics();
	this.graphics_circle.beginFill(turquoise);
	this.graphics_circle.drawCircle(0,this.y + 16,10);
	this.graphics_circle.endFill();

	app.stage.addChild(this.graphics_bar);
	app.stage.addChild(this.graphics_circle);

	this.tick = function(){
		
		if(this.click){
			
			var xx = (mx - 1) - this.x;
			this.f = xx / this.w;
		}

		this.graphics_circle.x = this.x + this.f * this.w;
	}
}

var Particle = function(x,y){

	this.x = x;
	this.y = y;
	this.vy = 2 + Math.random() * 3;
	this.vx = -2 + Math.random() * 4;

	this.w = 2 + Math.random() * 3;

	this.g = new PIXI.Graphics();
	this.g.beginFill(getColor(Math.random() * 240,Math.random() * 240,Math.random() * 240),1);
	this.g.drawRect(0,0,this.w,this.w);
	this.g.endFill();

	app.stage.addChild(this.g);

	this.tick = function(){

		this.x += this.vx;
		this.y += this.vy;

		this.g.x = this.x;
		this.g.y = this.y;
	}
}

var ParticleRain = function(){

	this.particles = [];

	for(var i = 0;i < 2000;i++){
		this.particles.push(new Particle(Math.random() * WIDTH,-500 + Math.random() * 500));
	}

	this.tick = function(){

		for(var i = 0;i < this.particles.length;i++){
			this.particles[i].tick();
		}
	}
}

/*****************************************************************************************/

var aux = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "ñ", "l", "k", "j", "h", "g", "f", "d", "s", "a", "z", "x", "c", "v", "b", "n", "m", "A", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ñ", "L", "K", "J", "H", "G", "F", "D", "S", "Z", "X", "C", "V", "B", "N", "M", " "];

var image;
var images = [];
var image_names = [];
var img = [];

var buttons = [];

var palette;
var color_picker;
var color_radius;
var clock; 
var clock2;
var wait;
var text_users;

var btn_pencil;
var btn_brush;
var btn_fill;
var btn_erase;

var button_join;
var inputbox;

var charge;
var slider;

var timer = 0;

var pr;

var button_exit;
var button_search;

setScreen(0);
document.oncontextmenu = function(){return false;}


/*****************************************************************************************/

function setScreen(S){

	SCREEN = S;

	while(app.stage.children[0]){ 
		app.stage.removeChild(app.stage.children[0]); 
	}

	app.stage.addChild(back);

	if(S == 0){

		inputbox = new InputBox("CENTER",290,300,20,turquoise);
		button_join = new Button("CENTER",350,300,"Ingresar",22,turquoise);

		buttons.push(button_join);
		buttons.push(inputbox);

	}else if(S == 1){

		images=[];
		
		palette = new Palette(1000 - 32 * SCALE - 292,700 - 32 * SCALE - 20);
		drawPalette();

		image = new Image(32,1000 - 32 * SCALE - 20,700 - 32 * SCALE - 20,SCALE);

		var c = 0;

		for(var y = 0;y < 6;y++){
			for(var x = 0;x < 3;x++){
				
				if(c < USERS - 1){
					images.push(new Image(32,8 + x * 100,8 + y * 100,3));
					c++;
				}
			}
		}

		color_picker = new ColorPicker();
		color_picker.show(false);

		color_radius = new ColorRadius();
		color_radius.show(false);

		clock = new Text("00:00",400,20,50);
		clock.add();

		slider = new Slider(1000 - 32 * SCALE - 292,630,255);

		buttons.push(slider);

		btn_pencil = new ImageButton(322,565,50,50,turquoise,tex_pencil);
		btn_brush = new ImageButton(378,565,50,50,turquoise,tex_brush);
		btn_fill = new ImageButton(434,565,50,50,turquoise,tex_fill);
		btn_erase = new ImageButton(490,565,50,50,turquoise,tex_erase);

		btn_pencil.canswitch = true;
		btn_brush.canswitch = true;
		btn_fill.canswitch = true;
		btn_erase.canswitch = true;

		buttons.push(btn_pencil);
		buttons.push(btn_brush);
		buttons.push(btn_fill);
		buttons.push(btn_erase);
		
	}else if(S == 2){

		wait = new Text("Buscando Partidas..","CENTER",200,50);
		wait.add();

		charge = new Charge((WIDTH - 100) / 2 + 46,390);

		clock2 = new Text("00:00","CENTER",305,25);
		clock2.text.alpha = 0.5;
		clock2.add();

		text_users = new Text("usuarios online : ","CENTER",280,18);
		text_users.text.alpha = 0.35;
		text_users.add();

	}else if(S == 3){

		voted = false;

		var text = new Text("Se acabó el tiempo","CENTER",50,50);
		text.add();

		var text2 = new Text("Votá a tu favorito","CENTER",115,20);
		text2.add();

		//CREATE IMAGES FOR VOTING <--

		img = [];
		var count = 0;

		for(var i = 0;i < images.length;i++){
			if(images[i].id != -9){count++;}
		}

		for(var i = 0;i < count;i++){
			img.push(new Image(32,i * 166.666666 - (Math.trunc(i / 6) * WIDTH),160 + 166.666666 * (Math.trunc(i / 6)),5,images[i].pixels));
			img[img.length - 1].id = images[i].id;
		}

	}else if(S == 4){

		var t = "";

		if(winner.player.id == ID){
			t = "¡¡GANASTE!!";
			pr = new ParticleRain();
		}else {
			t = "GANADOR ☻";
		}

		var text = new Text(t,"CENTER",50,60);
		text.add();

		var text2 = new Text(winner.player.name,"CENTER",150,30);
		text2.text.tint = alizarin;
		text2.add();

		var img_winner = new Image(32,(WIDTH - 32 * 10) / 2,250,10,winner.pixels);

		button_exit = new Button("CENTER",600,300,"Volver",22,turquoise);
		buttons.push(button_exit);

	}else if(S == 5){


		button_search = new Button("CENTER",300,300,"Buscar Partida",22,turquoise);
		buttons.push(button_search);

		var text = new Text("@"+USERNAME,20,20,30);
		text.add();
	}
}

/*****************************************************************************************/

function setId(data){
	ID = data;
}

function info(data){

	if(data.type == "wait"){

		if(SCREEN != 2){setScreen(2);}

		var t = "00";

		if(data.time != undefined){
			if(data.time < 10){t = "0"+data.time;}else{t = data.time;}
		}

		if(data.users != undefined){

			text_users.setText("usuarios online : "+data.users);
			USERS = data.users;
		}

		clock2.setText("00:"+t);

	}else if(data.type == "finish"){

		if(SCREEN != 3){setScreen(3);}

	}else if(data.type == "finish_votes"){
		
		var pvot = 0;

		img.push(new Image(32,img.length * 166.666666 - (Math.trunc(img.length / 6) * WIDTH),160 + 166.666666 * (Math.trunc(img.length / 6)),5,image.pixels));
		img[img.length - 1].id = ID;

		for(var i = 0;i < img.length;i++){
			for(var j = 0;j < data.images.length;j++){

				if(img[i].id == data.images[j].player.id){

					var t = new Text(data.images[j].votes,0,0,40);
					t.add();

					t.set(img[i].offx + ((img[i].size * img[i].scale) - t.text.width) / 2,img[i].offy + ((img[i].size * img[i].scale) - t.text.height) / 2);

					for(k = 0;k < img[i].graphics.length;k++){

						if(img[i].id != ID){
							img[i].graphics[k].alpha = 0.3;
						}else {
							img[i].graphics[k].alpha = 0.5;
						}
					}
				}
			}
		}

		timer = 1;

		winner = data.winner;
		console.log(data);
	}
}

function reset(){

	room = "none";
	word = "none_";


	voted = false;
}

function fin(){
	info({'type':'finish'});
}

function setRoom(data){

	room = data.name;
	word = data.word;

	console.log(data);

	setScreen(1);
}

function drawPalette(){

	var r = 255;
	var g = 0;
	var b = 0;

	var c = 0;
	var k = 1;

	var state = 0;

	for(var y = 0;y < palette.image.size;y++){
		for(var x = 0;x < palette.image.size;x++){

			if(x < 235){
				palette.image.paint(x,y,r * k,g * k,b * k);
			}else {
				palette.image.paint(x,y,255 - y,255 - y,255 - y);
			}

			if(state == 0){
				if(g < 255){g += 6;}
			}else if(state == 1){
				if(r > 0){r -= 6;}
			}else if(state == 2){
				if(b < 255){b += 6;}
			}else if(state == 3){
				if(g > 0){g -= 6;}
			}else if(state == 4){
				if(r < 255){r += 6;}
			}else if(state == 5){
				if(b > 0){b -= 6;}
			}

			c++;

			if(c >= 42){
				c = 0;
				state++;
			}
		}

		r = 255;
		g = 0;
		b = 0;
		c = 0;

		state = 0;

		k -= 1 / 255;
	}
}

function setTime(m,s){
	if(SCREEN == 1){
		if(s < 10){s = "0" + s;}
		clock.setText(m + ":" + s);
	}
}

function gameLoop(delta){

	for(var i = 0;i < buttons.length;i++){
		
		if(buttons[i].tick != undefined){
			buttons[i].tick();
		}
	}

	if(SCREEN == 0){

		if(button_join.delayclick){

			USERNAME = inputbox.str;
			if(USERNAME == ""){USERNAME = "Pintor anonimo";}

			button_join.click = false;

			setScreen(5);
		}

	}else if(SCREEN == 1){

	}else if(SCREEN == 2){

		charge.tick();

	}else if(SCREEN == 3){

		if(timer != 0){timer++;}
		if(timer > 120){timer = 0;setScreen(4);}

	}else if(SCREEN == 4){

		if(pr != undefined){pr.tick();}

		if(button_exit.delayclick){

			finish();
			button_exit.delayclick = false;

			setScreen(5);

			reset();
		}

	}else if(SCREEN == 5){

		if(button_search.delayclick){

			socket_join(USERNAME);

			button_search.click = false;
		}
	}
}
var count=0;
function paintOnline(id,name,xy,r,g,b){ //paint another canvas
	if(SCREEN == 1){

		if(id != ID){

			var flag = false;

			for(var i = 0;i < images.length;i++){

				if(images[i].id == id){

					images[i].paintXY(xy,r,g,b);
					flag = true;

					break;
				}
			}
			
			if(!flag){

				for(var i = 0;i < images.length;i++){

					if(images[i].id == -9){
						
						images[i].id = id;
						images[i].name = name;
						images[i].paintXY(xy,r,g,b);

						image_names[i] = new Text(name,images[i].offx,images[i].offy,12);
						image_names[i].text.visible = false;
						image_names[i].add();

						break;
					}
				}
			}
		}

	}
}

function paint(x,y,r,g,b){ //function that paints my own canvas :) 

	var xx = Math.trunc((x - image.offx) / SCALE);
	var yy = Math.trunc((y - image.offy) / SCALE);


	if(xx >= 0 && xx < image.size && yy >= 0 && yy < image.size){

		if(xx != oldx || yy != oldy){

			var color = image.getPixel(x,y);

			if(r != color.r || g != color.g || b != color.b){

				image.paint(xx,yy,r,g,b);
				image.socket_paint(xx,yy,r,g,b);

				oldx = xx;
				oldy = yy;
		
			}
		}
	}
}

function pick_color(x,y){

	var color = palette.image.getPixel(x,y);

	R = color.r;
	G = color.g;
	B = color.b;

	color_picker.setPos(mx,my);
	color_picker.setColor(R,G,B);
	color_picker.show(true);
}

function mouseInput(){

	if(mx > image.offx && mx < image.offx + image.size * SCALE && my > image.offy && my < image.offy + image.size * SCALE){

		color_picker.show(false);

		if(btn_pencil.switched){

			paint(mx,my,R,G,B);

		}else if(btn_brush.switched){

			var rad = slider.f * 10;

			if(rad < 1){rad = 1;}

			for(var x = -rad;x < rad;x++){
				for(var y = -rad;y < rad;y++){

					if(x * x + y * y < rad * rad){
						paint(mx + x * SCALE,my + y * SCALE,R,G,B);
					}
				}
			}

		}else if(btn_fill.switched){

			var oldp = image.getPixel(mx,my);
			paint(mx,my,R,G,B);
			var p = image.getPixel(mx,my);

			for(var i = 0;i < 70;i++){

				for(var x = 0;x < image.size;x++){
					for(var y = 0;y < image.size;y++){

						var pp = image.getPixelAt(x,y);

						if(pp.r == p.r && pp.g == p.g && pp.b == p.b){

							p_up = image.getPixelAt(x,y-1);
							p_down = image.getPixelAt(x,y+1);
							p_right = image.getPixelAt(x+1,y);
							p_left = image.getPixelAt(x-1,y);

							if(p_up != undefined){
								if(p_up.r == oldp.r && p_up.g == oldp.g && p_up.b == oldp.b && (p_up.r != p.r || p_up.g != p.g || p_up.b != p.b)){
									image.paint(x,y-1,p.r,p.g,p.b);
									image.socket_paint(x,y-1,p.r,p.g,p.b);
								}
							}

							if(p_down != undefined){
								if(p_down.r == oldp.r && p_down.g == oldp.g && p_down.b == oldp.b && (p_down.r != p.r || p_down.g != p.g || p_down.b != p.b)){
									image.paint(x,y+1,p.r,p.g,p.b);
									image.socket_paint(x,y+1,p.r,p.g,p.b);
								}
							}

							if(p_right != undefined){
								if(p_right.r == oldp.r && p_right.g == oldp.g && p_right.b == oldp.b && (p_right.r != p.r || p_right.g != p.g || p_right.b != p.b)){
									image.paint(x+1,y,p.r,p.g,p.b);
									image.socket_paint(x+1,y,p.r,p.g,p.b);
								}
							}

							if(p_left != undefined){
								if(p_left.r == oldp.r && p_left.g == oldp.g && p_left.b == oldp.b && (p_left.r != p.r || p_left.g != p.g || p_left.b != p.b)){
									image.paint(x-1,y,p.r,p.g,p.b);
									image.socket_paint(x-1,y,p.r,p.g,p.b);					
								}
							}
						}
					}
				}

			}

		}else if(btn_erase.switched){

			var rad = slider.f * 10;

			if(rad < 1){rad = 1;}

			for(var x = -rad;x < rad;x++){
				for(var y = -rad;y < rad;y++){

					if(x * x + y * y < rad * rad){
						paint(mx + x * SCALE,my + y * SCALE,255,255,255);
					}
				}
			}
		}

	}else if(mx > palette.x && mx < palette.x + 255 && my > palette.y && my < palette.y + 255){

		color_picker.show(true);
		pick_color(mx,my);

	}else {
		color_picker.show(false);
	}
}

app.stage.on('pointermove',function(e){

	mx = e.data.getLocalPosition(app.stage).x;
	my = e.data.getLocalPosition(app.stage).y;

	if(SCREEN == 1){

		if(btn_brush.switched || btn_erase.switched){

			if(mx > image.offx && mx < image.offx + image.size * SCALE && my > image.offy && my < image.offy + image.size * SCALE){
				
				color_radius.show(true);
				color_radius.setPos(mx,my);
				color_radius.setSize(slider.f * 110);

			}else {
				color_radius.show(false);
			}

		}else {
			color_radius.show(false);
		}

		if(click){
			mouseInput();
		}else {

			for(var i = 0;i < images.length;i++){

				if(mx > images[i].offx && mx < images[i].offx + images[i].size * images[i].scale && my > images[i].offy && my < images[i].offy + images[i].size * images[i].scale){

					for(var j = 0;j < images[i].graphics.length;j++){
						images[i].graphics[j].alpha = 0.3;
					}

					if(image_names[i] != null){image_names[i].text.visible = true;}

				}else {

					for(var j = 0;j < images[i].graphics.length;j++){
						images[i].graphics[j].alpha = 1;
					}

					if(image_names[i] != null){image_names[i].text.visible = false;}
				}
			}
		}

	}else if(SCREEN == 3){

	}

	if(click){

		for(var i = 0;i < buttons.length;i++){

			if(!(mx > buttons[i].x && mx < buttons[i].x + buttons[i].w && my > buttons[i].y && my < buttons[i].y + buttons[i].h)){
				buttons[i].click = false;
				buttons[i].old_click = false;
			}
		}

	}else {

		for(var i = 0;i < buttons.length;i++){

			if(mx > buttons[i].x && mx < buttons[i].x + buttons[i].w && my > buttons[i].y && my < buttons[i].y + buttons[i].h){
				buttons[i].hover = true;
			}else {
				buttons[i].hover = false;
			}
		}
	}

});

app.stage.on('pointerdown',function(e){

	click = true;
	
	if(SCREEN == 1){
		mouseInput();
	}

	for(var i = 0;i < buttons.length;i++){

		if(mx > buttons[i].x && mx < buttons[i].x + buttons[i].w && my > buttons[i].y && my < buttons[i].y + buttons[i].h){
			
			buttons[i].click = true;

			if(buttons[i].canswitch){

				buttons[i].switched = true;

				for(var j = 0;j < buttons.length;j++){

					if(buttons[i] != buttons[j]){
						buttons[j].switched = false;
					}	
				}
			}

		}else{
			buttons[i].click = false;
			buttons[i].selected = false;
		}
	}

	if(SCREEN == 3){

		if(!voted){

			for(var i = 0;i < img.length;i++){

				if(mx > img[i].offx && mx < img[i].offx + img[i].size * img[i].scale && my > img[i].offy && my < img[i].offy + img[i].size * img[i].scale){
					socket_addVote(img[i].id);
				}
			}

			voted = true;
		}

	}

});

app.stage.on('pointerup',function(e){

	click = false;

	if(SCREEN == 1){
		color_picker.show(false);
	}

	for(var i = 0;i < buttons.length;i++){
		buttons[i].click = false;
	}

});

function onkeydown(e){
	
	var k = e.key;

	for(var i = 0;i < buttons.length;i++){
		
		if(buttons[i].selected){

			if(e.keyCode == 8){
				buttons[i].setText(buttons[i].str.slice(0,buttons[i].str.length - 1));
			}else {

				var flag = false;

				for(var j = 0;j < aux.length;j++){
					if(k == aux[j]){flag = true;}
				}

				if(flag){buttons[i].setText(buttons[i].str + e.key);}
			}

		}
	}
}


/*******************************************************************/

function getHex(n) { 

  var hex = Number(Math.round(n)).toString(16);

  if (hex.length < 2) {hex = "0" + hex;}
  return hex;
}

function getColor(r,g,b){
	return '0x' + getHex(r) + getHex(g) + getHex(b);
}

function getColorRGBA(r,g,b,a){
	return '0x' + getHex(r) + getHex(g) + getHex(b) + getHex(a);
}

function getColorCSS(r,g,b){
	return '#' + getHex(r) + getHex(g) + getHex(b);
}

function getX(i,size){
	return i % size;
}

function getY(i,size){
	return Math.trunc(i / size);
}

function getXY(x,y,size){
	return size * y + x;
}
function fullscreen(){

    canvas.webkitRequestFullscreen();

    /*canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock ||canvas.webkitRequestPointerLock;
    canvas.requestPointerLock();*/
}