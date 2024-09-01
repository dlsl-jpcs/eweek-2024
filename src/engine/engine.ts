import { Position } from "../utils";


export abstract class Entity {
    Position: Position = new Position(0, 0);

    constructor() {
    }

    abstract update(deltaTime: number): void;

    abstract render(context: CanvasRenderingContext2D): void;
}


export default class Engine {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private lastTime: number = 0;

    private entities: Entity[] = [];

    constructor() {
        this._canvas = window.document.getElementById('canvas') as HTMLCanvasElement;
        document.body.appendChild(this._canvas);

        this._context = this._canvas.getContext('2d')!;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    init() {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;



        this.lastTime = performance.now();

        this.gameLoop();
    }

    gameLoop() {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime: number) {
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    render() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._context.save();

        // isometric transform
        this._context.translate(this._canvas.width / 2, 0);
        this._context.scale(1, 0.5);
        this._context.rotate(Math.PI / 4);

        this.entities.forEach(entity => entity.render(this._context));

        this._context.restore();
    }

}