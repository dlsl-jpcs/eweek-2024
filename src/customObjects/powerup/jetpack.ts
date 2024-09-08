import { SphereGeometry } from "three";
import { GameLogic, GameState } from "../../component/gameLogic";
import { Powerup } from "./powerup";

import * as THREE from "three";
import { Boat } from "../boat";

export class Jetpack extends Powerup {

    gameLogic!: GameLogic;

    // private flyHeight: number = 1;
    private fov: number = 50;
    private speed: number = 0;
    private maxSpeed: number = 1;

    private player!: Boat;

    constructor() {
        super("Jetpack");
    }

    getRenderObject(): THREE.Object3D {
        const geom = new SphereGeometry(10, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0xFFA500 });

        return new THREE.Mesh(geom, mat);
    }


    override getCollisionBox(): THREE.Box3 {
        return new THREE.Box3().setFromObject(this.renderObject);
    }

    public start(): void {
        super.start();
        this.player = this.findEntityByTag("player") as Boat
        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;
    }

    public getDuration(): number {
        return 5;
    }

    override update(deltaTime: number): void {
        super.update(deltaTime);

        if (!this.triggered) {
            return;
        }

        this.timer += deltaTime;

        if (this.timer >= this.getDuration()) {
            this.gameLogic.removeSpeedModifier();

            this.fov = Math.max(this.fov - 0.8, 50);
            this.engine.getCamera().fov = this.fov;
            this.engine.getCamera().updateProjectionMatrix();

            if (this.fov <= 50) {
                this.destroy();
            }

            this.player.isFlying = false;

        } else {
            this.speed = Math.min(this.speed + 0.1, this.maxSpeed);
            this.gameLogic.setSpeedModifier((_current: number) => {
                return this.speed;
            });

            this.fov = Math.min(this.fov + 0.1, 120);
            this.engine.getCamera().fov = this.fov;
            this.engine.getCamera().updateProjectionMatrix();
            this.player.isFlying = true;

            this.player.velocity.y = 60;

            if (this.player.mesh.position.y >= 300) {
                this.player.velocity.y = 0;
            }
        }
    }

    override onTrigger(): void {
        super.onTrigger();

    }



    public onDestroy(): void {
        super.onDestroy();
    }

    isGameOver() {
        return this.gameLogic.getGameState() === GameState.OVER;
    }
}