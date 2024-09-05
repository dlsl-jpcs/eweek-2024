import * as THREE from "three";
import { Entity } from "../engine/engine";
import { getModel, ICEBERG } from "../utils/resource";
import { Sea } from "./sea";


//Iceberg
export class Iceberg extends Entity {

    mesh: THREE.Object3D;

    private sea!: Sea;

    constructor() {
        super("iceberg");

        this.mesh = getModel(ICEBERG).scene.clone();
        this.mesh.scale.set(15,
            15,
            15);

        this.object = this.mesh;
    }


    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea;
    }



    update(deltaTime: number): void {
        this.mesh.position.x += (100 * this.sea.getSpeed() * deltaTime);
    }
}