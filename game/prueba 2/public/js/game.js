var app = new PIXI.Application({width:900,height:600});
document.body.appendChild(app.view);

document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

app.ticker.add(delta => gameLoop(delta));

/******************************************************************/

var scrollx = 0;
var scrolly = 0;
var scrollz = 0;

var rot = 0;
var angle = 0;

var sx = 0;
var sz = 0;

var key_w = false;
var key_s = false;
var key_a = false;
var key_d = false;
var key_space = false;
var key_shift = false;

var key_right = false;
var key_left = false;

/******************************************************************/

var Point = function(x,y,z,w){

	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;

	this.theta = 0;

	this.graphics = new PIXI.Graphics();

	this.graphics.beginFill(getColor(255,255,255),1);
	this.graphics.drawCircle(0,0,50);
	this.graphics.endFill();

	this.timer = 0;

	this.show = true;

	this.tick = function(){

		var px = this.x;
		var pz = this.z;

		var ox = -scrollx;
		var oy = -scrollz - 500;

		var r = getRadians(rot);

		this.x = Math.cos(r) * (px-ox) - Math.sin(r) * (pz-oy) + ox;
		this.z = Math.sin(r) * (px-ox) + Math.cos(r) * (pz-oy) + oy;

		this.timer += 0.1;

		if(this.z < -500 - scrollz){

			if(this.show){app.stage.removeChild(this.graphics);}
			this.show = false;

		}else if(!this.show){

			app.stage.addChild(this.graphics);
			this.show = true;
		}

		this.scale = 500 / (500 + this.z + scrollz);

		this.xx = (this.x + scrollx) * this.scale + 450;
		this.yy = (this.y + scrolly) * this.scale + 300;
		this.ww = this.w * this.scale;

		this.graphics.x = this.xx;
		this.graphics.y = this.yy;

		this.graphics.width = this.ww;
		this.graphics.height = this.ww;

		this.c = (this.z + this.y * 3 + scrollz) / 4;
		if(this.c > 255){this.c = 255;}else if(this.c < 0){this.c = 0;}

		this.graphics.tint = getColor(255 - this.c,255 - this.c,255 - this.c);
	}

	this.tick();

	app.stage.addChild(this.graphics);
}

var Player = function(x,y,z){

	this.x = x;
	this.y = y;
	this.z = z;

	this.w = 60;

	this.angle = 0;

	this.show = true;
	this.name = "Humberto";

	this.graphics = new PIXI.Graphics();

	this.graphics.beginFill(getColor(200,50,10),1);
	this.graphics.drawCircle(0,0,this.w);
	this.graphics.endFill();

	this.text_style = new PIXI.TextStyle({
		fill: getColorCSS(240,240,240)
	});

	this.text = new PIXI.Text(this.name,this.text_style);


	this.tick = function(){

		var px = this.x;
		var pz = this.z;

		var ox = -scrollx;
		var oy = -scrollz - 500;

		var r = getRadians(rot);

		this.x = Math.cos(r) * (px-ox) - Math.sin(r) * (pz-oy) + ox;
		this.z = Math.sin(r) * (px-ox) + Math.cos(r) * (pz-oy) + oy;

		if(this.z < -500 - scrollz){

			if(this.show){app.stage.removeChild(this.graphics);
						  app.stage.removeChild(this.text);}
			this.show = false;

		}else if(!this.show){

			app.stage.addChild(this.graphics);
			app.stage.addChild(this.text);

			this.show = true;
		}

		this.scale = 500 / (500 + this.z + scrollz);
		
		this.xx = (this.x + scrollx) * this.scale + 450;
		this.yy = (this.y + scrolly) * this.scale + 300;

		this.ww = this.w * this.scale;

		this.graphics.x = this.xx;
		this.graphics.y = this.yy;

		this.graphics.width = this.ww;
		this.graphics.height = this.ww;

		this.c = (this.z + scrollz) / 10;
		if(this.c > 255){this.c = 255;}else if(this.c < 0){this.c = 0;}

		this.graphics.tint = getColor(255 - this.c,255 - this.c,255 - this.c);

		this.text.x = this.xx - this.ww / 2;
		this.text.y = this.yy - this.ww / 1.1;
		this.text.height = this.ww / 3.5;
		this.text.scale.x = this.text.scale.y;
	}

	this.tick();

	app.stage.addChild(this.graphics);
	app.stage.addChild(this.text);
}

/******************************************************************/

var points = [];

var player = new Player(0,0,0);

var pivot = new Point(0,-500,50,10);

for(var x = 0;x < 30;x++){
	for(var z = 30;z >= 0;z--){
		points.push(new Point(x * 30,Math.sin(x / 5) * 50,z * 30,20));
	}
}

var line = new PIXI.Graphics();
var show_line = true;
app.stage.addChild(line);

function gameLoop(delta){

	input();

	scrollx += sx;
	scrollz += sz;

	for(var i = 0;i < points.length;i++){
		points[i].tick();
	}

	player.tick();

	pivot.tick();

	pivot.x = player.x + Math.sin(getRadians(player.angle - angle)) * 50;
	pivot.z = player.z + Math.cos(getRadians(player.angle - angle)) * 50;
	pivot.y = player.y;

	if(player.xx > 0 && player.yy > 0 && player.xx < 900 && player.yy < 600 && pivot.xx > 0 && pivot.yy > 0 && pivot.xx < 900 && pivot.yy < 600){
		
		if(!show_line){
			app.stage.addChild(line);
			show_line = true;
		}

		line.clear();
		line.beginFill(getColor(200,100,0),1);
		line.lineStyle(3, 0xffd900, 1);
		line.moveTo(player.xx,player.yy);
		line.lineTo(pivot.xx,pivot.yy);
		line.endFill();

	}else {
		app.stage.removeChild(line);
		show_line = false;
	}
}

function input(){

	if(key_w){
		if(sz > -4){sz -= 0.5;}
	}else if(key_s){
		if(sz < 4){sz += 0.5;}
	}else {
		sz = 0;
	}

	if(key_a){
		if(sx < 3){sx += 0.5;}
	}else if(key_d){
		if(sx > -3){sx -= 0.5;}
	}else {
		sx = 0;
	}

	if(key_right){
		if(rot < 1){rot += 0.1;}
	}else if(key_left){
		if(rot > -1){rot -= 0.1;}
	}else {
		rot = 0;
	}

	angle += rot;

	if(key_space){
		scrolly += 3;
	}else if(key_shift){
		scrolly -= 3;
	}

	if(key_w || key_s || key_d || key_a || key_space || key_shift){
		user(-scrollx,-scrolly,-scrollz);
	}

	if(rot != 0){
		rotation(angle);
	}
}

function draw(x,y,z){

	player.x = x;
	player.y = y;
	player.z = z;
}

function draw2(a,id){

	if(socket.id != id){
		player.angle = a;
	}
}

function keydown(e){

	if(e.keyCode == 87){
		key_w = true;
	}else if(e.keyCode == 83){
		key_s = true;
	}

	if(e.keyCode == 65){
		key_a = true;
	}else if(e.keyCode == 68){
		key_d = true;
	}

	if(e.keyCode == 32){
		key_space = true;
	}else if(e.keyCode == 16){
		key_shift = true;
	}

	if(e.keyCode == 39){
		key_right = true;
	}else if(e.keyCode == 37){
		key_left = true;
	}
}

function keyup(e){

	if(e.keyCode == 87){
		key_w = false;
	}else if(e.keyCode == 83){
		key_s = false;
	}

	if(e.keyCode == 65){
		key_a = false;
	}else if(e.keyCode == 68){
		key_d = false;
	}

	if(e.keyCode == 32){
		key_space = false;
	}else if(e.keyCode == 16){
		key_shift = false;
	}

	if(e.keyCode == 39){
		key_right = false;
	}else if(e.keyCode == 37){
		key_left = false;
	}
}

/******************************************************************/

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

function getRadians(degrees) {
  return degrees * Math.PI / 180;
};
 
function getDegrees(radians) {
  return radians * 180 / Math.PI;
};