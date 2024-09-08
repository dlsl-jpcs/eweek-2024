import { SphereGeometry } from "three";
import { GameLogic, GameState } from "../../component/gameLogic";
import { Powerup } from "./powerup";

import * as THREE from "three";

export class Speedup extends Powerup {

    gameLogic!: GameLogic;

    private baseSpeed: number = 0;

    private fov: number = 50;
    private speed: number = 0;
    private maxSpeed: number = 1;

    constructor() {
        super("Speedup");
    }

    getRenderObject(): THREE.Object3D {
        const geom = new SphereGeometry(10, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        return new THREE.Mesh(geom, mat);
    }


    override getCollisionBox(): THREE.Box3 {
        return new THREE.Box3().setFromObject(this.renderObject);
    }

    public start(): void {
        super.start();

        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;
    }

    public getDuration(): number {
        return 3;
    }

    override update(deltaTime: number): void {
        super.update(deltaTime);

        if (!this.triggered) {
            return;
        }

        this.timer += deltaTime;





        if (this.timer >= this.getDuration()) {
            this.gameLogic.removeSpeedModifier();

            this.fov = Math.max(this.fov - 1, 50);
            this.engine.getCamera().fov = this.fov;
            this.engine.getCamera().updateProjectionMatrix();

            console.log(this.fov);

            if (this.fov <= 50) {
                this.destroy();
            }
        } else {
            this.speed = Math.min(this.speed + 0.1, this.maxSpeed);
            this.gameLogic.setSpeedModifier((current: number) => {
                return this.speed;
            });

            this.fov = Math.min(this.fov + 0.1, 90);
            this.engine.getCamera().fov = this.fov;
            this.engine.getCamera().updateProjectionMatrix();
        }
    }

    override onTrigger(): void {
        super.onTrigger();

        this.baseSpeed = this.gameLogic.getSpeed();
    }



    public onDestroy(): void {
        super.onDestroy();
    }

    isGameOver() {
        return this.gameLogic.getGameState() === GameState.OVER;
    }
}