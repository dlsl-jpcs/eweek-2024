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

        this.mesh = new THREE.Object3D();
        this.object = this.mesh;

        // 0

        const toRadians = (angle: number) => angle * Math.PI / 180;
        const angle = toRadians(200);

        const distance = 600;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const iceberg = getModel(ISLAND).scene.clone();

        iceberg.scale.set(15, 15, 15);
        iceberg.position.set(x, y, 0);
        iceberg.rotation.z = angle + Math.PI / 2;

        this.mesh.add(iceberg);

        this.mesh.position.y = -600;
    }


    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea;
    }



    update(deltaTime: number): void {
        this.mesh.rotation.z -= this.sea.getSpeed() * deltaTime;

        // if rotation is greater than 2PI, destroy the object
        if (this.mesh.rotation.z < -2) {
            this.destroy();
        }
    }
}