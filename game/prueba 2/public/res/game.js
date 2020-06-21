var app = new PIXI.Application({width:800,height:600});
document.body.appendChild(app.view);

/*************************************************************/

var tex_back = PIXI.Texture.fromImage("js/back.png");
var back = new PIXI.Sprite(tex_back);

app.stage.interactive = true;
app.stage.addChild(back);

app.stage.on('pointerdown', function(e){
	console.log(e.data.getLocalPosition(app.stage));
});

/************************************************************/

app.ticker.add(delta => gameLoop(delta));

function gameLoop(delta){

}

/*****************************************************/

/*var Ball = function(x,y){

	this.x = x;
	this.y = y;

	this.xa = -2 + Math.random() * 4;
	this.ya = -2 + Math.random() * 4;

	this.graphics = new PIXI.Graphics();
	this.graphics.beginFill(0xFF0000, 1);
	this.graphics.drawRect(this.x,this.y,3,3);

	this.timer = 0;

	stage.addChild(this.graphics);

	this.move = function(){

		this.timer++;

		if(this.timer > 60){

			this.xa = -3 + Math.random() * 6;
			this.ya = -3 + Math.random() * 6;
			
			this.timer = 0;
		}

		this.x += this.xa;
		this.y += this.ya;

		this.graphics.x = this.x;
		this.graphics.y = this.y;
	}
}
}*/