var app = new PIXI.Application({width:1000,height:700});
document.body.appendChild(app.view);

app.ticker.add(delta => gameLoop(delta));

/*****************************************************************/

var ID = -999;

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
var greensea = "0x16a085";

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

var Text = function(str,x,y,size){

	this.str = str;

	this.x = x;
	this.y = y;

	this.size = size;

	this.style2 = new PIXI.TextStyle({
		fontFamily: 'Arial',
	    fontSize: this.size,
	    fontWeight: 'bold',
	    fill: [getColorCSS(0,0,0)], 
	});

	this.text2 = new PIXI.Text(this.str,this.style2);
	this.text2.x = this.x;
	this.text2.y = this.y + 4;

	this.style = new PIXI.TextStyle({
		fontFamily: 'Arial',
	    fontSize: this.size,
	    fontWeight: 'bold',
	    fill: [clouds], 
	});

	this.text = new PIXI.Text(this.str,this.style);
	this.text.x = this.x;
	this.text.y = this.y;

	this.setText = function(str){
		this.text.text = str;
		this.text2.text = str;
	}

	this.add = function(){
		app.stage.addChild(this.text2);
		app.stage.addChild(this.text);
	}

	this.set = function(x,y){

		this.x = x;
		this.y = y;

		this.text.x = x;
		this.text.y = y;
		this.text2.x = x;
		this.text2.y = y;
	}
}

var Button = function(x,y,str,color){

	this.x = x;
	this.y = y;

	this.ww = 0;

	this.w;
	this.h;

	this.click = false;

	this.color = color;
	this.str = str;

	this.text = new Text(this.str,this.x,this.y,20);

	this.w = this.text.text.width + 50;

	if(this.ww != 0){
		this.w = this.ww;
	}

	this.h = this.text.text.height + 20;

	this.text.set(this.x + (this.w - this.text.text.width) / 2,this.y + (this.h - this.text.text.height) / 2);

	this.graphics = new PIXI.Graphics();
	this.graphics.beginFill(getColor(255,255,255),1);
	this.graphics.drawRoundedRect(this.x,this.y,this.w,this.h,10);
	this.graphics.tint = turquoise;
	this.graphics.endFill();

	app.stage.addChild(this.graphics);
	this.text.add();
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

var image = new Image(32,1000 - 32 * SCALE - 20,700 - 32 * SCALE - 20,SCALE);

var images = [];

for(var x = 0;x < 3;x++){
	for(var y = 0;y < 3;y++){
		images.push(new Image(32,8 + x * 100,8 + y * 100,3));
	}
}

var palette = new Palette(1000 - 32 * SCALE - 292,700 - 32 * SCALE - 20);
drawPalette();

var color_picker = new ColorPicker();
color_picker.show(false);

var buttons = [];

var text = new Text("00:00",410,20,50);
var button = new Button(400,200,"Join",turquoise);

buttons.push(button);

text.add();

/******************************************************************/

function setId(data){
	ID = data;
}

function setRoom(data){

	room = data.room;
	word = data.word;

	console.log(data);
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

	if(s < 10){s = "0" + s;}
	text.setText(m + ":" + s);
}

function gameLoop(delta){

}

function paintOnline(id,xy,r,g,b){ //paint another canvas

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

	if(click){
		paint(mx,my);
	}

});

app.stage.on('pointerdown',function(e){

	click = true;
	paint(mx,my);

	for(var i = 0;i < buttons.length;i++){

		if(mx > buttons[i].x && mx < buttons[i].x + buttons[i].w && my > buttons[i].y && my < buttons[i].y + buttons[i].h){
			buttons[i].click = true;
			buttons[i].graphics.tint = greensea;
		}else{
			buttons[i].click = false;
		}
	}

});

app.stage.on('pointerup',function(e){

	click = false;
	color_picker.show(false);

	for(var i = 0;i < buttons.length;i++){

		buttons[i].click = false;
		buttons[i].graphics.tint = turquoise;
	}

});

/*******************************************************************/

function getHex(n) { 

  var hex = Number(Math.round(n)).toString(16);

  if (hex.length < 2) {hex = "0" + hex;}
  return hex;
}

function getColor(r,g,b){
	return '0x' + getHex(r) + getHex(g) + getHex(b);
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