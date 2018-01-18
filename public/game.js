var app = new PIXI.Application({width:1000,height:700});
document.body.appendChild(app.view);
document.body.addEventListener('keydown',e => onkeydown(e));

app.ticker.add(delta => gameLoop(delta));

/*****************************************************************/

var ID = -999;
var USERNAME = "anonimo";

var SCREEN = 0; //0 = menu,1 = game,2 = joining/wait,

var WIDTH = 1000;
var HEIGHT = 700;

var room = "none";
var word = "none_";

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

var Image = function(size,offx,offy,scale){

	this.size = size;
	this.pixels = [];

	this.offx = offx;
	this.offy = offy;
	this.scale = scale;

	this.id = -9;

	for(var i = 0;i < this.size * this.size;i++){
		this.pixels.push({'r' : 255,'g' : 255,'b' : 255});
	}

	this.graphics = [];

	for(var i = 0;i < this.size * this.size;i++){

		this.graphics.push(new PIXI.Graphics());

		var g = this.graphics[this.graphics.length - 1];

		g.beginFill(getColor(255,255,255),1);
		g.lineStyle(0,0x000000);
		g.drawRect(offx + getX(i,this.size) * scale,offy + getY(i,this.size) * scale,scale,scale);
		g.endFill();

		app.stage.addChild(this.graphics[this.graphics.length - 1]);
	}

	this.paint = function(x,y,r,g,b){

		var xy = getXY(x,y,this.size);

		this.pixels[xy].r = r;
		this.pixels[xy].g = g;
		this.pixels[xy].b = b;

		this.graphics[xy].tint = getColor(r,g,b);
	}

	this.paintXY = function(xy,r,g,b){

		this.pixels[xy].r = r;
		this.pixels[xy].g = g;
		this.pixels[xy].b = b;

		this.graphics[xy].tint = getColor(r,g,b);
	}

	this.socket_paint = function(x,y,r,g,b){

		var xy = getXY(x,y,this.size);
		socket_paint(ID,xy,r,g,b);
	}

	this.getPixel = function(x,y){

		var xx = Math.trunc(x - this.offx);
		var yy = Math.trunc(y - this.offy);

		if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size){

			var xy = getXY(xx,yy,this.size);
			return this.pixels[xy];
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

/*****************************************************************************************/

var aux = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "ñ", "l", "k", "j", "h", "g", "f", "d", "s", "a", "z", "x", "c", "v", "b", "n", "m", "A", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ñ", "L", "K", "J", "H", "G", "F", "D", "S", "Z", "X", "C", "V", "B", "N", "M", " "];

var image;
var images = [];

var buttons = [];

var palette;
var color_picker;
var clock; 
var clock2;
var wait;
var text_users;

var button_join;
var inputbox;

var charge;

setScreen(0);

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

		palette = new Palette(1000 - 32 * SCALE - 292,700 - 32 * SCALE - 20);
		drawPalette();

		image = new Image(32,1000 - 32 * SCALE - 20,700 - 32 * SCALE - 20,SCALE);

		for(var x = 0;x < 3;x++){
			for(var y = 0;y < 6;y++){
				images.push(new Image(32,8 + x * 100,8 + y * 100,3));
			}
		}

		color_picker = new ColorPicker();
		color_picker.show(false);

		clock = new Text("00:00",400,20,50);
		clock.add();

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
	}
}

/*****************************************************************************************/

function setId(data){
	ID = data;
}

function info(data){

	if(data.type == "wait"){

		//console.log("--> EN LISTA DE ESPERA --> " + data.users + " jugadores." + " tiempo : " + data.time);

		if(SCREEN != 2){setScreen(2);}

		var t = "00";

		if(data.time != undefined){
			if(data.time < 10){t = "0"+data.time;}else{t = data.time;}
		}

		if(data.users != undefined){
			text_users.setText("usuarios online : "+data.users);
		}

		clock2.setText("00:"+t);
	}
}

function setRoom(data){

	room = data.room;
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
		buttons[i].tick();
	}

	if(SCREEN == 0){

		if(button_join.delayclick){

			USERNAME = inputbox.str;

			if(USERNAME == ""){USERNAME = "Pintor anonimo";}

			socket_join(USERNAME);

			button_join.click = false;
		}

	}else if(SCREEN == 1){

	}else if(SCREEN == 2){

		charge.tick();
	}
}

function paintOnline(id,xy,r,g,b){ //paint another canvas

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
						images[i].paintXY(xy,r,g,b);

						break;
					}
				}
			}
		}

	}
}

function paint(x,y){ //function that paints my own canvas :) 

	var s = SCALE;

	if(x > image.offx && x < image.offx + image.size * s && y > image.offy && y < image.offy + image.size * s){

		var xx = Math.trunc((x - image.offx) / s);
		var yy = Math.trunc((y - image.offy) / s);

		if(xx != oldx || yy != oldy){

			image.paint(xx,yy,R,G,B);
			image.socket_paint(xx,yy,R,G,B);

			oldx = xx;
			oldy = yy;
		}

		color_picker.show(false);

	}else if(x >= palette.x && x < palette.x + 255 && y >= palette.y && y < palette.y + 255){

		var color = palette.image.getPixel(x,y);

		R = color.r;
		G = color.g;
		B = color.b;

		color_picker.setPos(mx,my);
		color_picker.setColor(R,G,B);
		color_picker.show(true);

	}else {

		color_picker.show(false);
	}
}

app.stage.on('pointermove',function(e){

	mx = e.data.getLocalPosition(app.stage).x;
	my = e.data.getLocalPosition(app.stage).y;

	if(click && SCREEN == 1){
		paint(mx,my);
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
		paint(mx,my);
	}

	for(var i = 0;i < buttons.length;i++){

		if(mx > buttons[i].x && mx < buttons[i].x + buttons[i].w && my > buttons[i].y && my < buttons[i].y + buttons[i].h){
			buttons[i].click = true;
		}else{
			buttons[i].click = false;
			buttons[i].selected = false;
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