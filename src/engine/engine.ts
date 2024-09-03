import * as THREE from 'three';

import { Position, Size } from '../utils';
import { gameLogic } from '../component/gameLogic';

export abstract class Entity {

    public object: THREE.Object3D;
    public tag: string;

    protected engine!: Engine;


    constructor(tag: string) {
        this.object = new THREE.Object3D();
        this.tag = tag;
    }

    /**
     * INTERNAL USE ONLY
     * 
     * this is called by the engine to bind the entity to the engine instance
     * 
     * @param engine the engine instance
     */
    setEngine(engine: Engine) {
        this.engine = engine;
    }

    /**
     * Find an entity by its tag
     * @param tag the tag of the entity
     * @returns the entity with the specified tag or undefined if not found
     */
    public findEntityByTag(tag: string) {
        if (!this.engine) {
            throw new Error("Engine not set for entity");
        }
        return this.engine.findEntityByTag(tag);
    }


    /**
     * Called when the entity is added to the scene, and the engine is set.
     */
    public awake() {

    }


    /**
     * Called before the engine starts the game loop
     */
    public start() {

    }

    /**
     * Called when the entity is removed from the scene
     */
    public onDestroy() {

    }

    /**
     * Update the entity, called every frame
     * 
     * @param deltaTime the time since the last frame
     */
    abstract update(deltaTime: number): void;
}

export default class Engine {
    private width: number = 0;
    private height: number = 0;
    private aspectRatio: number = 0;
    private fieldOfView: number = 0;
    private nearPlane: number = 0;
    private farPlane: number = 0;

    private scene: THREE.Scene = new THREE.Scene();
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private clock!: THREE.Clock;

    // the dom element where the scene will be displayed
    private container!: HTMLElement;

    private lastTime: number = 0;

    private entities: Entity[] = [];

    constructor() {
        this.init();
    }

    addEntity(entity: Entity) {
        entity.setEngine(this);
        this.entities.push(entity);
        this.scene.add(entity.object);

        entity.awake();
    }
    

    /**
     * Initialize the scene, camera, renderer, and other properties
     */
    private init() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        console.log(this.width, this.height);

        this.aspectRatio = this.width / this.height;
        this.fieldOfView = 60;
        this.nearPlane = 0.1;
        this.farPlane = 2000;
        const camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            this.aspectRatio,
            this.nearPlane,
            this.farPlane
        );

        camera.position.x = 0;
        camera.position.z = 0;
        camera.position.y = 300;



        // look down
        camera.lookAt(new THREE.Vector3(0,
            0,
            0));

        // rotate 90 degress
        camera.rotation.z = Math.PI / 2;
        // look up 25 degrees
        camera.rotation.y = Math.PI / 6;

        this.camera = camera;

        const renderer = new THREE.WebGLRenderer({
            // Allow transparency to show the gradient background
            // we defined in the CSS
            alpha: true,
            // Activate the anti-aliasing; this is less performant,
            // but, as our project is low-poly based, it should be fine :)
            antialias: true
        });

        renderer.setSize(this.width, this.height);

        // Enable shadow rendering
        renderer.shadowMap.enabled = true;

        // Add the DOM element of the renderer to the 
        // container we created in the HTML
        const container = document.getElementById('world')!;
        container.appendChild(renderer.domElement);

        this.renderer = renderer;
        this.container = container;

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.handleWindowResize.bind(this), false);

        this.findEntitiesByType(typeof (Entity));
    }

    handleWindowResize() {
        // update height and width of the renderer and the camera
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Start the game loop, which will call the update and render functions
     */
    start() {
        this.clock.start();

        this.entities.forEach(entity => entity.start());

        this.gameLoop();
    }

    gameLoop() {
        this.update(this.clock.getDelta());
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime: number) {
        gameLogic.update(deltaTime);
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


    /**
     * @returns the current scene to be rendered
     */
    getCurrentScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    findEntityByTag(tag: string) {
        return this.entities.find(entity => entity.tag === tag);
    }

    findEntitiesByType(type: any) {
        return this.entities.filter(entity => entity instanceof type);
    }
}