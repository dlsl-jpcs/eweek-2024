import './style.css'

import Engine, {Entity} from './engine/engine'

class Water extends Entity {
    constructor() {
        super();
        this.Size = {width: 500, height: window.innerWidth * 3};
        this.Position = {x: 0, y: 0};
    }

    update(deltaTime: number) {}

  	render(context: CanvasRenderingContext2D) {
    	context.fillStyle = 'lightblue';
    	context.fillRect(
        this.Position.x - (this.Size.width / 2),
        this.Position.y - (this.Size.height / 2), this.Size.width,
        this.Size.height);
  	}
}

const engine = new Engine();

engine.init();
engine.addEntity(new Water());