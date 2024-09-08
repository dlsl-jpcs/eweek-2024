import { pow } from "three/webgpu";
import { Entity } from "../../engine/engine";
import { Sea } from "../sea";
import { Powerup } from "./powerup";
import { Speedup } from "./speedup";
import * as THREE from "three";

export class PowerUpSpawner extends Entity {


    powerups: Array<new (...args: any) => Powerup> = [
        Speedup
    ]

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

    }

    spawnPowerup() {

        const powerupType = this.getRandomPowerup();
        const powerup = this.engine.instantiate(powerupType);

        console.log(this.engine.getEntities());
    }
}

