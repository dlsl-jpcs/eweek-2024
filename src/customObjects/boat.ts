import * as THREE from "three";
import { Entity } from "../engine/engine";


const gravity = 0.005;

/**
 * The markers that indicate the front and back of the boat.
 * 
 * This is used to calculate the angle of the boat.
 * (The back and front of the boat may be at different heights, as the boat
 * is in the water and the water has waves. We used the difference in height
 * to calculate the angle of the boat)
 * 
 * @see {Boat#update}
 */
export class BoatMarker extends Entity {
    mesh: THREE.Object3D;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);


    constructor(isFront: boolean = false) {
        super("boat" + (isFront ? "Front" : "Back"));

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
            }),
        );

        this.mesh.position.set(isFront ? -140 : -50, 0, 0);

        this.object = this.mesh;
    }

    update(deltaTime: number): void {
        if (!this.engine) {
            return;
        }
        if (!this.engine.findEntityByTag("player")) {
            return;
        }
        const boat = this.engine.findEntityByTag("player") as Boat;
        if (!boat.mesh) {
            return;
        }


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
            this.mesh.position.y = intersect.point.y + 10;
            this.velocity.y = 0;
        }

        const boatPos = boat.mesh.position;
        this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, boatPos.z);
    }
}

/**
 * The, well, boat
 */
export class Boat extends Entity {
    mesh: THREE.Object3D;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    constructor(mesh: THREE.Object3D) {
        super("player");

        this.mesh = mesh;

        const scale = 10;
        this.mesh.scale.set(scale,
            scale,
            scale);

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
        this.updateGravity();
        this.updateRotation();
    }

    updateGravity() {
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
            this.mesh.position.y = intersect.point.y + 18;
            this.velocity.y = 0;
        }
    }

    /**
     * Update the rotation of the boat based on the markers
     */
    updateRotation() {
        const boatFront = this.engine.findEntityByTag("boatFront") as BoatMarker;
        const boatBack = this.engine.findEntityByTag("boatBack") as BoatMarker;

        // calculate the angle between the two markers
        const angle = Math.atan2(
            boatFront.mesh.position.y - boatBack.mesh.position.y,
            boatFront.mesh.position.x - boatBack.mesh.position.x,
        );

        // flip the angle so that the boat is facing the right direction


        this.mesh.rotation.z = angle * 2;


        // when moving left or right, face the direction of movement (using the velocity)
        // rotate it slightly to make it look like it's leaning
        if (this.velocity.z < 0 && this.mesh.rotation.x > -0.3) {
            this.mesh.rotation.x -= 0.01;
        } else if (this.velocity.z > 0 && this.mesh.rotation.x < 0.3) {
            this.mesh.rotation.x += 0.01;
        } else if (this.mesh.rotation.x < 0) {
            this.mesh.rotation.x += 0.001;
        } else if (this.mesh.rotation.x > 0) {
            this.mesh.rotation.x -= 0.001;
        }
    }
}
