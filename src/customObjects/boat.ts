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

    gameLogic!: GameLogic;

    controlsEnabled: boolean = false;

    constructor() {
        super("player");

        this.mesh = getModel(SAILBOAT).scene.clone();

        this.mesh.position.y = 100;
        this.mesh.position.x = -100;

        const scale = 10;
        this.mesh.scale.set(scale,
            scale,
            scale);

        this.object = this.mesh;

        // listen to window resize, so we can rescale the boat
        window.addEventListener("resize", () => {
            let scale = window.innerWidth / 84;
            scale = Math.min(scale, 15);
            this.mesh.scale.set(scale,
                scale,
                scale);
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
            if (key === "a" || key === "d") {
                this.velocity.z = 0;
            }
        });
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
        this.updateGravity();
        this.updateRotation();
        this.updateCollision();
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

    updateCollision() {
        const obstacles = this.engine.findEntitiesByType(Obstacle);

        for (const obstacle of obstacles) {
            const collision = this.checkCollision(obstacle as Obstacle);
            if (collision) {
                this.gameLogic.setGameState(GameState.OVER);
            }
        }
    }

    checkCollision(obstacle: Obstacle): boolean {
        const boatBox = new THREE.Box3().setFromObject(this.mesh);
        const obstacleBox = new THREE.Box3().setFromObject(obstacle.mesh);

        return boatBox.intersectsBox(obstacleBox);
    }
}
