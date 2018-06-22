let population;
let lifespan = 250;
let count = 0;
let target;
let maxForce = 0.2;
let generation = 0;

let rx = 300;
let ry = 250;
let rw = 200;
let rh = 10;

class DNA{
	constructor(genes){
		if (genes) {
			this.genes = genes;
		} else {
			this.genes = [];
			this.getNewGenes();
		}
	}

	getNewGenes(){
		for (let i = 0; i < lifespan; i++) {
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxForce);
		}
	}

	crossover(partner){
		let newGenes = [];
		let mid = floor(random(this.genes.length));
		for (let i = 0; i < this.genes.length; i++) {
			if (i > mid) {
				newGenes[i] = this.genes[i];
			} else {
				newGenes[i] = partner.genes[i];
			}
		}
		return new DNA(newGenes);
	}

	mutation(){
		for (let i = 0; i < this.genes.length; i++) {
			if (random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	}

}

class Population{
	constructor(){
		this.rockets = [];
		this.popSize = 60;
		this.matingPool = [];
		this.initPop();
	}

	initPop(){
		for (let i = 0; i < this.popSize; i++) {
			this.rockets[i] = new Rocket();
		}
	}

	evaluate(){
		let maxFit = 0;
		for (let i = 0; i < this.popSize; i++) {
			this.rockets[i].calcFitness();
			if (this.rockets[i].fitness > maxFit) {
				maxFit = this.rockets[i].fitness;
			}
		}

		this.matingPool = [];

		let orderedRockets = this.rockets.sort(function(a,b){
			return b.fitness - a.fitness;
		});

		console.log("Best Time Achieved", orderedRockets[0].timeAchieved);

		this.matingPool.push(...orderedRockets.splice(0, 10));

		for(let i = 0; i < 20; i++){
			let selected = random(orderedRockets);
			let index = orderedRockets.indexOf(selected);

			this.matingPool.push(selected);
			orderedRockets.splice(index, 1)
		}
	}

	selection(){
		let newRockets = [];
		for (let i = 0; i < this.popSize - 10; i++) {
			let parentA = random(this.matingPool).dna;
			let parentB = random(this.matingPool).dna;
			let child = parentA.crossover(parentB);
			child.mutation();
			newRockets.push(new Rocket(child));
		}

		for (let i = 0; i < 10; i++) {
			newRockets.push(new Rocket(this.matingPool[i].dna));
		}

		this.rockets = newRockets;
	}

	run(){
		for (let i = 0; i < this.popSize; i++) {
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}
}

class Rocket{
	constructor(dna){
		this.pos = createVector(width/2, height*.8);
		this.vel = createVector();
		this.acc = createVector();
		this.completed = false;
		this.crashed = false;
		this.timeAchieved = 0;
		if (dna) {
			this.dna = dna;
		} else {
			this.dna = new DNA();
		}
		this.fitness = 0;
	}

	applyForce(force){
		this.acc.add(force);
	}

	calcFitness(){
		let d = dist(this.pos.x, this.pos.y, target.x, target.y);

		this.fitness = map(d, 0, width, width, 0);
		if (this.completed) {
			this.fitness *= 10;
			let bonus = this.fitness * map(this.timeAchieved, 0, 400, 100, 0);
			this.fitness += bonus;

		}
		if (this.crashed) {
			this.fitness /= 10;
		}
	}

	update(){
		let d = dist(this.pos.x, this.pos.y, target.x, target.y);
		if (d < 10) {
			this.completed = true;
			if(this.timeAchieved === 0){
				this.timeAchieved = count;
			}
			this.pos = target.copy();
		}

		if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
			this.crashed = true;
		}

		//checking edges here
		if (this.pos.x > width || this.pos.x < 0) {
			this.crashed = true;
		}
		if (this.pos.y > height || this.pos.y < 0) {
			this.crashed = true;
		}

		this.applyForce(this.dna.genes[count]);
		if (!this.completed && !this.crashed) {
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.vel.limit(4);
		}
	}

	show() {
		push();
		noStroke();
		fill(255, 100);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		rect(0, 0, 25, 5);
		pop();
	}
}


function setup() {
	createCanvas(800, 600);
	frameRate(120);
	population = new Population();
	target = createVector(width/2, height/5);
}

function draw() {

	background(0);

	noStroke();
	fill(0, 0, 200, 150);
	ellipse(target.x, target.y, 48, 48);
	fill(255, 225, 0, 75);
	ellipse(target.x, target.y, 32, 32);
	fill(200, 0, 0, 100);
	ellipse(target.x, target.y, 16, 16);

	population.run();
	count++;

	if (count === lifespan) {
		population.evaluate();
		population.selection();
		console.log("Generation Number: " + generation);
		generation++;
		count = 0;
	}

	fill(255, 50);
	rect(rx, ry, rw, rh);

}