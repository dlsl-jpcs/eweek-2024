import './style.css'

import Engine, {Entity} from './engine/engine'
import { Position, randomIntRange } from './utils';

class Wave {
	Position: Position = new Position(0, 0);
	Speed: number = 1.0;
	Opacity: number = 1.0;
}

class Water extends Entity {

	private MaxWaveCount: number = 50;
    private Waves: Wave[] = [];

	BoatSpeed: number = 100.0;

    constructor() {
        super();
        this.Size = {width: 500, height: window.innerWidth * 3};
        this.Position = {x: 0, y: 0};

		for (let i = 0; i < this.MaxWaveCount; i++) {
			let wave = new Wave();
			// random
			wave.Position = {x:randomIntRange((this.Size.width / 2) - 20, (-(this.Size.width / 2) + 20)), y: randomIntRange(-600, 600)};
			wave.Speed = Math.random() * 2.0 + 1.0;
			wave.Opacity = randomIntRange(50, 100) / 100;
			this.Waves.push(wave);
		}
    }

    update(deltaTime: number) {
		for (const [i, wave] of this.Waves.entries()) {
			wave.Position.y += (wave.Speed + this.BoatSpeed) * deltaTime / 1000;

			if (wave.Position.y > window.innerWidth * 1) {
				wave.Position.y = randomIntRange(-(window.innerWidth * 2), -(window.innerWidth * 4));
				wave.Position.x = randomIntRange((this.Size.width / 2) - 20, (-(this.Size.width / 2) + 20));
				wave.Opacity = randomIntRange(50, 100) / 100;
			}
		}
	}

  	render(context: CanvasRenderingContext2D) {
    	context.fillStyle = 'lightblue';
    	context.fillRect(
        this.Position.x - (this.Size.width / 2),
        this.Position.y - (this.Size.height / 2), this.Size.width,
        this.Size.height);

		for (const [i, wave] of this.Waves.entries()) {
			context.fillStyle = `rgba(219, 237, 243, ` + wave.Opacity + `)`;
			context.fillRect(wave.Position.x, wave.Position.y, 2, 50);
		}
  	}
}

class Boat extends Entity {

	private IsTapping: boolean = false;

    constructor() {
        super();
        this.Size = {width: 25, height: 50};
        this.Position = {x: 0, y: 0};
    }

    update(deltaTime: number) {
		if (!this.IsTapping) {
			this.Position.x += 200.0 * deltaTime / 1000;
		}
		else 
		{
			this.Position.x -= 200.0 * deltaTime / 1000;
		}
	}

  	render(context: CanvasRenderingContext2D) {
    	context.fillStyle = `rgba(0, 0, 0, 1.0)`;
		context.fillRect(
		this.Position.x - (this.Size.width / 2),
		this.Position.y - (this.Size.height / 2), this.Size.width,
		this.Size.height);
  	}

	touchStart() {
		this.IsTapping = true;
	}
	
	touchEnd() {
		this.IsTapping = false;
	}
}

const engine = new Engine();

engine.init();
engine.addEntity(new Water());

const boat = new Boat();
engine.addEntity(boat);

console.log('Window InnerWidth: ' + window.innerWidth + ' px');
console.log('Window InnerHeight: ' + window.innerHeight + ' px');

document.addEventListener('touchstart', function(event) {
    boat.touchStart();
});

document.addEventListener('touchend', function(event) {
    boat.touchEnd();
});
