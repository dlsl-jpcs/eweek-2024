import * as THREE from "three";
import { Entity } from "../engine/engine";


/**
 * The, well, boat
 */
export class Boat extends Entity {
    mesh: THREE.Object3D;

    constructor(mesh: THREE.Object3D) {
        super();

        this.mesh = mesh;
        this.mesh.scale.set(15,
            15,
            15);

        this.object = this.mesh;
    }

    update(deltaTime: number): void {
        // TODO: Update the boat's position based on wave height
    }
}
