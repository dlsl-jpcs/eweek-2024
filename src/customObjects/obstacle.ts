import * as THREE from "three";
import { Entity } from "../engine/engine";
import { getModel, ICEBERG, ISLAND } from "../utils/resource";
import { Sea } from "./sea";


//Iceberg
export class Iceberg extends Entity {

    mesh: THREE.Object3D;

    private sea!: Sea;

    constructor() {
        super("iceberg");

        this.mesh = getModel(ISLAND
        ).scene.clone();
        this.mesh.scale.set(1,
            1,
            1);

        this.object = this.mesh;
    }


    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea;
    }



    update(deltaTime: number): void {
        this.mesh.position.x += (100 * this.sea.getSpeed() * deltaTime);
    }
}