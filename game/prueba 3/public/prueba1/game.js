var app = new PIXI.Application({width:800,height:600});
document.body.appendChild(app.view);
document.addEventListener('keydown',keydown);

/*************************************************************/

var tex_back = PIXI.Texture.fromImage("res/back.png");
var back = new PIXI.Sprite(tex_back);

var click = false;

var mx = -9;
var my = -9;

var mode = true; //true = draw,false = erase

var balls = [];

app.stage.interactive = true;
app.stage.addChild(back);

/************************************************************/

var cursor = new PIXI.Graphics();
cursor.beginFill(getColor(255,0,255),1);
cursor.drawRect(mx,my,20,20);

app.stage.addChild(cursor);

var Ball = function(x,y){

	this.x = x;
	this.y = y;

	this.graphics = new PIXI.Graphics();
	this.graphics.beginFill(getColor(200,0,0),1);
	this.graphics.drawCircle(this.x,this.y,20);

	app.stage.addChild(this.graphics);

	this.destroy = function(){
		app.stage.removeChild(this.graphics);
	}
}

/************************************************************/

app.ticker.add(delta => gameLoop(delta));

function gameLoop(delta){

}

function draw(x,y){
	balls.push(new Ball(x,y));
}

function destroy(id){

	if(balls[id] != undefined){
		balls[id].destroy();
		balls.splice(id,1);
	}
}

app.stage.on('pointerdown', function(e){
	click = true;
});

app.stage.on('pointermove',function(e){

	mx = e.data.getLocalPosition(app.stage).x;
	my = e.data.getLocalPosition(app.stage).y;

	cursor.x = mx;
	cursor.y = my;

	if(click){

		user(mx,my);
	}
});

app.stage.on('pointerup',function(){
	click = false;
});

function keydown(key){

	if(key.keyCode == 88){
		mode = !mode;
	}
}

/******************************************************************************************/

function getHex(n) { 

  var hex = Number(Math.round(n)).toString(16);

  if (hex.length < 2) {hex = "0" + hex;}
  return hex;
};

function getColor(r,g,b){
	return '0x' + getHex(r) + getHex(g) + getHex(b);
}