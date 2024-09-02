import * as THREE from "three";
import { Entity } from "../engine/engine";


const gravity = 0.005;
/**
 * The, well, boat
 */
export class Boat extends Entity {
    mesh: THREE.Object3D;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    constructor(mesh: THREE.Object3D) {
        super("player");

        this.mesh = mesh;
        this.mesh.scale.set(15,
            15,
            15);

        this.object = this.mesh;

        // move boat left or right based on keypress
        window.addEventListener("keydown", (event) => {
            const key = event.key;
            if (key === "a") {
                this.velocity.z = 2;
            } else if (key === "d") {
                this.velocity.z = -2;
            }
        });

        window.addEventListener("keyup", (event) => {
            const key = event.key;
            if (key === "a" || key === "d") {
                this.velocity.z = 0;
            }
        });
    }

    update(deltaTime: number): void {
        this.velocity.y -= gravity;
        this.mesh.position.add(this.velocity);

        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
        }

        const ray = new THREE.Raycaster(
            this.mesh.position,
            new THREE.Vector3(0, -1, 0),
        );

        const sea = this.engine.findEntityByTag("sea")!;
        const intersectObjects = ray.intersectObject(sea.object);

        if (intersectObjects.length > 0) {
            const intersect = intersectObjects[0];
            this.mesh.position.y = intersect.point.y + 25;
            this.velocity.y = 0;
        }
    }
}
