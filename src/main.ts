import Engine, { Entity } from './engine/engine'
import './style.css'

class Water extends Entity {
  private y: number = 0;

  update(deltaTime: number) {
    this.y += 0.01 * deltaTime;
  }

  render(context: CanvasRenderingContext2D) {
    context.fillStyle = 'blue';

    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }


}

const engine = new Engine();

engine.init();
engine.addEntity(new Water());