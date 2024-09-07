import * as THREE from "three";
import { Entity } from "../engine/engine";
import { getModel, SAILBOAT } from "../utils/resource";
import { Obstacle as Obstacle } from "./obstacle";
import { GameLogic, GameState } from "../component/gameLogic";


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

        this.updateGravity(boat);
    }

    updateGravity(boat: Boat) {
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

        const boatPos = boat.object.position;
        this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, boatPos.z);
    }
}

/**
 * The, well, boat
 */
export class Boat extends Entity {
    mesh: THREE.Object3D;
    boatMesh!: THREE.Object3D;
    collisionBox!: THREE.Box3Helper;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    gameLogic!: GameLogic;

    controlsEnabled: boolean = false;



    scale: number = 1;

    constructor() {
        super("player");

        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 100;
        this.mesh.position.x = -100;

        const boat = getModel(SAILBOAT).scene.clone();
        boat.position.y = -100;
        boat.position.x = -10;

        const scale = 10;
        boat.scale.set(scale,
            scale,
            scale);
        this.mesh.add(boat);

        this.boatMesh = boat;
        this.object = this.mesh;

        // listen to window resize, so we can rescale the boat
        window.addEventListener("resize", () => {
            let scale = window.innerWidth / 84;
            this.scale = Math.min(scale, 15);
            boat.scale.set(this.scale,
                this.scale,
                this.scale);
        });

        window.addEventListener("keydown", (event) => {
            if (!this.controlsEnabled) {
                return;
            }

            const key = event.key;
            if (key === "a") {
                this.velocity.z = 2;
            } else if (key === "d") {
                this.velocity.z = -2;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (!this.controlsEnabled) {
                return;
            }
            const key = event.key;
            if (key === "a" && this.velocity.z > 0) {
                this.velocity.z = 0;
            }

            if (key === "d" && this.velocity.z < 0) {
                this.velocity.z = 0;
            }
        });


        // control the boat with device tilt
        window.addEventListener("deviceorientation", (event) => {
            if (!this.controlsEnabled) {
                return;
            }

            const tilt = event.gamma!;

            if (tilt < -10) {
                this.velocity.z = -2;
            } else if (tilt > 10) {
                this.velocity.z = 2;
            } else {
                this.velocity.z = 0;
            }
        });


        const collisionBox = new THREE.Box3().setFromObject(this.boatMesh);

        // adjust the collision box, take into account the scale
        collisionBox.min.z += 20 * this.scale;
        collisionBox.max.z -= 20 * this.scale;
        const box = new THREE.Box3Helper(collisionBox, 0xfffe6262);
        this.collisionBox = box;

        this.mesh.add(box);
    }



    override start(): void {
        this.gameLogic = this.engine.findEntityByTag("GameLogic") as GameLogic;


    }

    enableControls() {
        this.controlsEnabled = true;
    }

    disableControls() {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.controlsEnabled = false;
    }



    update(deltaTime: number): void {
        this.updateRotation();
        this.updateCollision();
        this.updateGravity();
        this.naturalCorrection();
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


        this.boatMesh.rotation.z = angle * 2;

        // rotate the boat so that it is perpendicular to the wave
        if (this.velocity.z > 0 && this.boatMesh.rotation.y < 0.1) {
            this.boatMesh.rotation.y += 0.005;
        } else if (this.velocity.z < 0 && this.boatMesh.rotation.y > -0.1) {
            this.boatMesh.rotation.y -= 0.005;
        }
    }


    /**
     * The boat should attempt to correct (straighten) itself naturally
     */
    naturalCorrection() {
        if (this.velocity.z === 0) {
            if (this.boatMesh.rotation.y < 0) {
                this.boatMesh.rotation.y += 0.005;
            } else if (this.boatMesh.rotation.y > 0) {
                this.boatMesh.rotation.y -= 0.005;
            }
        }
    }

    updateCollision() {
        const obstacles = this.engine.findEntitiesByType(Obstacle);

        for (const obstacle of obstacles) {
            const collision = this.checkCollision(obstacle as Obstacle);
            if (collision) {
                this.gameLogic.setGameState(GameState.OVER);
            }
        }
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
            this.mesh.position.y = intersect.point.y + 120;
            this.velocity.y = 0;
        }
    }

    checkCollision(obstacle: Obstacle): boolean {
        // mesh collision
        const thisMesh = this.collisionBox;
        const otherMesh = obstacle.getCollisionBox();

        const thisBox = new THREE.Box3().setFromObject(thisMesh);
        const otherBox = otherMesh;

        return thisBox.intersectsBox(otherBox);
    }
}
