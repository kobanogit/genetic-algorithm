/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
let target;
let maxForce = 100;
let generation = 0;

let podRadius = 400;
let checkPointRadius = 600;

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	distance(p) {
		return Math.hypot(this.x - p.x, this.y - p.y);
	}

	distance2(p) {
		return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
	}

	closest(pointA, pointB) {
		return null;
	}
}

class Unit extends Point {
	constructor(id, x, y, vx, vy, radius) {
		super(x, y);
		this.id = id;
		this.radius = radius;
		this.vx = vx;
		this.vy = vy;
	}

	collision(unit) {
		return new Point(this.x + this.vx, this.y + this.vy);
	}

	bounce(unit) {

	}

}

class Collision {
	constructor(unitA, unitB, time) {
		this.unitA = unitA;
		this.unitB = unitB;
		this.time = time;
	}
}

class DNA {
	constructor(genes) {
		this.genes = genes;
	}
}

class Pod extends Unit {
	constructor(id, x, y, vx, vy, radius, angle, nextCP, checked, timeout, partner, shield) {
		super(id, x, y, vx, vy, radius);
		this.timeout = 100;
		this.angle = angle;
		this.nextCP = nextCP;
		this.checked = checked;
		this.timeout = 100;
		this.partner = partner;
		this.shield = shield;
	}

	getAngle(p) {
		let d = this.distance(p);
		let dx = (p.x - this.x) / d;
		let dy = (p.y - this.y) / d;

		// Trigonométrie simple. On multiplie par 180.0 / PI pour convertir en degré.
		let a = Math.acos(dx) * 180.0 / Math.PI;

		// Si le point qu'on veut est en dessus de nous, il faut décaler l'angle pour qu'il soit correct.
		if (dy < 0) {
			a = 360.0 - a;
		}

		return a;
	}

	diffAngle(p) {
		let a = this.getAngle(p);
		// Pour connaitre le sens le plus proche, il suffit de regarder dans les 2 sens et on garde le plus petit
		// Les opérateurs ternaires sont la uniquement pour éviter l'utilisation d'un operateur % qui serait plus lent
		let right = this.angle <= a ? a - this.angle : 360.0 - this.angle + a;
		let left = this.angle >= a ? this.angle - a : this.angle + 360.0 - a;

		if (right < left) {
			return right;
		} else {
			// On donne un angle négatif s'il faut tourner à gauche
			return -left;
		}
	}

	rotate(p) {
		let a = this.diffAngle(p);

		// On ne peut pas tourner de plus de 18° en un seul tour
		if (a > 18.0) {
			a = 18.0;
		} else if (a < -18.0) {
			a = -18.0;
		}

		this.angle += a;

// L'opérateur % est lent. Si on peut l'éviter, c'est mieux.
		if (this.angle >= 360.0) {
			this.angle = this.angle - 360.0;
		} else if (this.angle < 0.0) {
			this.angle += 360.0;
		}
	}

	boost(thrust) {
		// N'oubliez pas qu'un pod qui a activé un shield ne peut pas accélérer pendant 3 tours
		if (this.shield) {
			return;
		}

// Conversion de l'angle en radian
		let ra = this.angle * Math.PI / 180.0;

// Trigonométrie
		this.vx += Math.cos(ra) * thrust;
		this.vy += Math.sin(ra) * thrust;
	}

	move(t) {
		this.x += this.vx * t;
		this.y += this.vy * t;
	}

	end() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.vx = Math.trunc(this.vx * 0.85);
		this.vy = Math.trunc(this.vy * 0.85);

		// N'oubliez pas que le timeout descend de 1 chaque tour. Il revient à 100 quand on passe par un checkpoint
		this.timeout -= 1;
	}

	resetPod(x, y, vx, vy, angle) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.angle = angle;
	}

	simulate() {
		let turns = 1;
		let fit = Infinity;
		let rdmThrust = 100;
		let x = getRandomIntInclusive((this.x - 1000), (this.x + 1000));
		let y = getRandomIntInclusive((this.y - 1000), (this.y + 1000));
		let point = new Point(x, y);
		let lastX = this.x;
		let lastY = this.y;
		let lastVx = this.vx;
		let lastVy = this.vy;
		let lastAngle = this.angle;
		for (let i = 0; i < turns; i++) {
			this.play(point, rdmThrust);
			fit = this.distance2(this.nextCP);
		}
		this.resetPod(lastX, lastY, lastVx, lastVy, lastAngle);
		return {fitness: fit, solution: (point.x + ' ' + point.y + ' ' + rdmThrust), thrust: rdmThrust}
	}

	play(p, thrust) {
		this.rotate(p);
		this.boost(thrust);
		this.move(1.0);
		this.end();
	}
}

class CheckPoint extends Unit {
	constructor(id, x, y, vx, vy, radius) {
		super(id, x, y, vx, vy, radius);
	}

	bounce(unit) {

	}
}

class Population {
	constructor(pod) {
		this.pods = [];
		for (let i = 0; i < 30; i++) {
			this.pods.push(pod);
		}
	}
}


function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

let turn = 0;
let myPod = new Pod(0, 0, 0, 0, 0, podRadius, 0, null, null, null, null, false);
// game loop
while (true) {
	let inputs = readline().split(' ');
	let x = parseInt(inputs[0]);
	let y = parseInt(inputs[1]);
	let nextCheckpointX = parseInt(inputs[2]); // x position of the next check point
	let nextCheckpointY = parseInt(inputs[3]); // y position of the next check point
	let nextCheckpointDist = parseInt(inputs[4]); // distance to the next checkpoint
	let nextCheckpointAngle = parseInt(inputs[5]); // angle between your pod orientation and the direction of the next checkpoint
	let input = readline().split(' ');
	let opponentX = parseInt(input[0]);
	let opponentY = parseInt(input[1]);

	let nextCP = new CheckPoint(1, nextCheckpointX, nextCheckpointY, 0, 0);
	myPod.x = x;
	myPod.y = y;
	myPod.angle = nextCheckpointAngle;
	myPod.nextCP = nextCP;
	// let population = new Population(myPod);

	let delay = 140;
	if (turn === 0) {
		delay = 990;
	}
	let now = new Date().getTime();
	let end = new Date().getTime() + delay;
	let solution = nextCheckpointX + ' ' + nextCheckpointY + ' 80';
	let thrust = 0;
	let fitness = Infinity;
	while (now < end) {
		now = new Date().getTime();
		let evaluate = myPod.simulate();
		if (evaluate.fitness < fitness) {
			printErr(evaluate.fitness);
			fitness = evaluate.fitness;
			solution = evaluate.solution;
			thrust = evaluate.thrust;
		}
	}

	myPod.play(myPod.nextCP, thrust);
	// You have to output the target position
	// followed by the power (0 <= thrust <= 100) or "BOOST"
	// i.e.: "x y thrust"
	print(solution);
	turn++;
}