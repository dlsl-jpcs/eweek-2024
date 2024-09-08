import { SphereGeometry } from "three";
import { GameLogic } from "../../component/gameLogic";
import { Powerup } from "./powerup";

import * as THREE from "three";

export class Speedup extends Powerup {

    gameLogic!: GameLogic;

    constructor() {
        super("Speedup");


    }

    getRenderObject(): THREE.Object3D {
        const geom = new SphereGeometry(10, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        return new THREE.Mesh(geom, mat);
    }

    override update(deltaTime: number): void {
        super.update(deltaTime);
    }

    override getCollisionBox(): THREE.Box3 {
        return new THREE.Box3().setFromObject(this.renderObject);
    }

    public start(): void {
        super.start();

        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;
    }

    override onTrigger(): void {
        super.onTrigger();
        if (!this.gameLogic) {
            return;
        }
        const currentSpeed = this.gameLogic.getSpeed();

        let speed = currentSpeed;

        const speedModifier = (current: number) => {
            return speed;
        }

        this.gameLogic.setSpeedModifier(speedModifier);

        // gradually increase the speed in a span of 3 seconds
        const interval = setInterval(() => {
            speed += 0.3;
            if (speed >= currentSpeed + 1) {
                clearInterval(interval);
            }
        }, 100);

        // increase fov
        const fovInterval = setInterval(() => {
            this.engine.getCamera().fov += 1;
            this.engine.getCamera().updateProjectionMatrix();

            if (this.engine.getCamera().fov >= 90) {
                clearInterval(fovInterval);
            }
        }, 20);

        setTimeout(() => {
            const interval = setInterval(() => {
                speed -= 0.1;
                if (speed <= currentSpeed || this.isDestroyed) {
                    clearInterval(interval);
                    this.gameLogic.removeSpeedModifier();
                }
            }, 100);

            const fovInterval = setInterval(() => {
                this.engine.getCamera().fov -= 1;
                this.engine.getCamera().updateProjectionMatrix();

                if (this.engine.getCamera().fov <= 50 || this.isDestroyed) {
                    clearInterval(fovInterval);
                }
            }, 20);
        }, 3000);
    }

    public onDestroy(): void {
        super.onDestroy();
        this.gameLogic.removeSpeedModifier();
        this.engine.getCamera().fov = 50;
    }
}