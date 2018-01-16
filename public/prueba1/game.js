var app = new PIXI.Application({width:700,height:600});
document.body.appendChild(app.view);

app.ticker.add(delta => gameLoop(delta));

/**************************************************************/

var index = 0;

var image = [{
	"size":100,
	"pixels":[]
}];

var timer = 0;

//loadImage();

/**************************************************************/

function gameLoop(delta){

	timer++;

	if(index != 0 && index < 11 && timer > 10){

		timer = 0;
		index++;

		drawImage();

	}
}

function loadImage(){

	for(var x = 0;x < 100;x++){
		for(var y = 0;y < 100;y++){

			var data = getPixel(x,y);

			image[0].pixels.push({'r':data[0],'g':data[1],'b':data[2]});
		}
	}

	index = 0;

	drawImage();
}

function getPixel(x,y) {

  	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var img = document.getElementById('img');

	canvas.width = img.width;
	canvas.height = img.height;
	context.drawImage(img, 0, 0 );

	var myData = context.getImageData(x,y, 1, 1);

	var data = [];
	data.push(myData.data[0]);
	data.push(myData.data[1]);
	data.push(myData.data[2]);

	return data;
}

function button_enter(){

	enter();
}

function button_exit(){

	exit();
}

function button_img0(){

	index = 0;
	drawImage();
}

function button_img1(){

	index = 1;
	drawImage();
}


function getImage(data){

	image = data;

	drawImage();
}

function drawImage(){

	for (var i = app.stage.children.length - 1; i >= 0; i--) {
		app.stage.removeChild(app.stage.children[i]);
	};


	var j = 0;

	for(var x = 0;x < image[index].size;x++){
		for(var y = 0;y < image[index].size;y++){

			var graphics = new PIXI.Graphics();

			graphics.beginFill(getColor(image[index].pixels[j].r,image[index].pixels[j].g,image[index].pixels[j].b),1);
			graphics.drawRect(50 + x * 5,50 + y * 5,4,4);
			graphics.endFill();

			app.stage.addChild(graphics);

			j++;
		}
	}
}

/**************************************************************/

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
