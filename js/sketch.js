var cols, rows;
var scl = 20;
var w = 1200;
var h = 1200;
var terrain = [];
var flying = 0;

function setup() {
	createCanvas(801, 801, WEBGL);
	cols = w / scl;
	rows = h / scl;
	for (var x = 0; x < cols; x++) {
		terrain[x] = [];
	}
	var yOff = 0;
	for (var y = 0; y < rows; y++) {
		var xOff = 0;
		for (var x = 0; x < cols; x++) {
			terrain[x][y] = map(noise(xOff, yOff), 0, 1, -60, 60);
			xOff += 0.2;
		}
		yOff += 0.2;
	}



}

function draw() {
	flying  -= map(mouseX, 0, width, 0.01, 0.2);
	var yOff = flying;
	for (var y = 0; y < rows; y++) {
		var xOff = 0;
		for (var x = 0; x < cols; x++) {
			terrain[x][y] = map(noise(xOff, yOff), 0, 1, -100, 100);
			xOff += 0.2;
		}
		yOff += 0.2;
	}
	rotateX(PI / 3);
	translate(-w / 2, -h / 2);
	background(51);
	strokeWeight(1);
	stroke(255);
	noFill();
	// fill(155, 70, 83, 1);

	for (var y = 0; y < rows - 1; y++) {
		beginShape(TRIANGLE_STRIP);
		for (var x = 0; x < cols - 1; x++) {
			if(y % 2 === 0){
				stroke(map(terrain[x][y], -100, 100, 0, 255), 255, 255, 25);
				vertex(x * scl, y * scl, terrain[x][y]);
				stroke(map(terrain[x + 1][y], -100, 100, 0, 255), 255, 255, 25);
				vertex((x + 1) * scl, y * scl, terrain[x + 1][y]);
				stroke(map(terrain[x][y + 1], -100, 100, 0, 255), 255, 255, 25);
				vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
				stroke(map(terrain[x + 1][y + 1], -100, 100, 0, 255), 255, 255, 25);
				vertex((x + 1) * scl, (y + 1) * scl, terrain[x + 1][y + 1]);
			}
			else{
				stroke(map(terrain[x][y], -100, 100, 0, 255), 255, 255, 25);
				vertex(x * scl, y * scl, terrain[x][y]);
				stroke(map(terrain[x][y + 1], -100, 100, 0, 255), 255, 255, 25);
				vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
			}

		}
		endShape();
	}

}