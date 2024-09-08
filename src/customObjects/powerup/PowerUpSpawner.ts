import { pow } from "three/webgpu";
import { Entity } from "../../engine/engine";
import { Sea } from "../sea";
import { Powerup } from "./powerup";
import { Speedup } from "./speedup";
import * as THREE from "three";
import { Jump } from "./jump";

export class PowerUpSpawner extends Entity {


    powerups: Array<new (...args: any) => Powerup> = [
        Speedup,
        Jump
    ]

    timer: number = 3;
    interval: number = 5;

    private sea!: Sea;


    constructor() {
        super("PowerUpSpawner");

        this.object = new THREE.Object3D();

        window.onkeyup = (e) => {
            if (e.key === "p") {
                this.spawnPowerup();
            }
        }


    }

    getRandomPowerup(): new (...args: any) => Powerup {
        const index = Math.floor(Math.random() * this.powerups.length);
        return this.powerups[index];
    }

    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea;
    }

    update(deltaTime: number): void {
        this.timer += deltaTime;
        if (this.timer >= this.interval) {
            this.timer = 0;
            this.spawnPowerup();
        }
    }

    spawnPowerup() {

        const powerupType = this.getRandomPowerup();
        const powerup = this.engine.instantiate(powerupType);

        const bounds = this.sea.getWidth() / 2;
        const lowerBound = -bounds + 100;
        const upperBound = bounds - 100;

        const z = Math.random() * (upperBound - lowerBound) + lowerBound;
        powerup.object.position.z = z;
    }
}

