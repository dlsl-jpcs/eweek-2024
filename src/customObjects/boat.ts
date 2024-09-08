import * as THREE from "three";
import { Entity } from "../engine/engine";
import { getModel, SAILBOAT } from "../utils/resource";
import { Obstacle as Obstacle } from "./obstacle";
import { GameLogic, GameState } from "../component/gameLogic";
import { MainMenu } from "../component/mainMenu";
import { Speedup } from "./powerup/speedup";
import { Powerup } from "./powerup/powerup";


const gravity = 0.05;

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
                // color: 0x00ff00,
                transparent: true,
                opacity: 0,
            }),
        );

        this.mesh.position.set(isFront ? -140 : -50, 0, 0);

        this.object = this.mesh;
    }

    update(_deltaTime: number): void {
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
    onGround: boolean = false;
    canJump: boolean = false;

    mainMenu!: MainMenu;

    activePowerups: Powerup[] = [];



    scale: number = 1;

    constructor() {
        super("player");

        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 100;
        this.mesh.position.x = -100;

        const boat = getModel(SAILBOAT).scene.clone();
        boat.position.y = -100;
        boat.position.x = -10;

        // find children named "boat"
        boat.traverse((child) => {
            if (child.name === "FLAG") {
                const mesh = child as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;
            }
        });

        const scale = document.documentElement.clientWidth / 84;
        this.scale = Math.min(scale, 10);
        boat.scale.set(this.scale,
            this.scale,
            this.scale);
        this.mesh.add(boat);

        this.boatMesh = boat;
        this.object = this.mesh;

        // listen to window resize, so we can rescale the boat
        window.addEventListener("resize", () => {
            let scale = document.documentElement.clientWidth / 84;
            this.scale = Math.min(scale, 10);
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

            if (key === "y") {
                this.velocity.y = 3;
            }
        });


        // when the user taps or clicks, jump
        window.addEventListener("click", () => {
            this.jump();
        });

        // control the boat with device tilt, use devicemotion
        window.addEventListener("devicemotion", (event) => {
            if (!this.controlsEnabled) {
                return;
            }

            const acceleration = event.accelerationIncludingGravity;
            this.velocity.z = -(acceleration?.x || 0) / 2;
        });




        const collisionBox = new THREE.Box3().setFromObject(this.boatMesh);

        // adjust the collision box, take into account the scale
        collisionBox.min.z += 2 * this.scale;
        collisionBox.max.z -= 2 * this.scale;

        collisionBox.min.x += 1.2 * this.scale;
        collisionBox.max.x -= 1.2 * this.scale;

        const box = new THREE.Box3Helper(collisionBox);
        box.visible = false;
        this.collisionBox = box;

        this.mesh.add(box);
    }

    public reset() {
        this.mesh.position.set(-100, 100, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.engine.getCamera().fov = 50;
        this.engine.getCamera().updateProjectionMatrix();
        this.canJump = false;

        this.gameLogic.removeSpeedModifier();
    }

    setCanJump(canJump: boolean) {
        this.canJump = canJump;
    }

    jump() {
        if (!this.canJump || !this.controlsEnabled || this.velocity.y > 0) {
            return;
        }

        this.velocity.y = 6;
    }

    override start(): void {
        this.gameLogic = this.engine.findEntityByTag("GameLogic") as GameLogic;
        this.mainMenu = this.engine.findEntityByTag("mainMenu") as MainMenu;
    }

    enableControls() {
        this.controlsEnabled = true;
    }

    disableControls() {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.controlsEnabled = false;
    }



    update(_deltaTime: number): void {
        this.updateRotation();
        this.updateCollision();
        this.updateGravity();
        this.naturalCorrection();

        this.updateCamera();

        for (const powerup of this.activePowerups) {
            if (powerup.isDestroyed()) {
                this.activePowerups.splice(this.activePowerups.indexOf(powerup), 1);
            }
        }
    }

    updateCamera() {
        const camera = this.engine.getCamera();

        // move the camera with the boat
        camera.position.z = this.mesh.position.z;
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
            const collision = this.checkCollision((obstacle as Obstacle).getCollisionBox());
            if (collision) {
                this.gameLogic.setGameState(GameState.OVER);
            }
        }

        const powerups = this.engine.findEntitiesByType(Powerup);
        for (const powerup of powerups) {
            const collision = this.checkCollision((powerup as Powerup).getCollisionBox());
            if (collision) {
                const collidedPowerup = powerup as Powerup;

                // check if the powerup is already active
                if (this.activePowerups.includes(collidedPowerup)) {
                    // if it is, just call the onReTrigger method
                    this.activePowerups[this.activePowerups.indexOf(collidedPowerup)].onReTrigger();
                } else {
                    // if it is not, call the onTrigger method
                    collidedPowerup.onTrigger();
                    this.activePowerups.push(collidedPowerup);
                }
            }
        }
    }

    updateGravity() {
        this.velocity.y -= gravity;
        this.mesh.position.add(this.velocity);

        const lowerBound = -380;
        const upperBound = 380;

        if (this.mesh.position.z < lowerBound) {
            this.mesh.position.z = lowerBound;
            this.velocity.z = 0;
        }

        if (this.mesh.position.z > upperBound) {
            this.mesh.position.z = upperBound;
            this.velocity.z = 0;
        }


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

            if (intersect.distance < 120) {
                this.mesh.position.y = intersect.point.y + 120;
                this.velocity.y = 0;
            }
        }
    }

    checkCollision(other: THREE.Box3): boolean {
        // mesh collision
        const thisMesh = this.collisionBox;

        const thisBox = new THREE.Box3().setFromObject(thisMesh);
        const otherBox = other;

        return thisBox.intersectsBox(otherBox);
    }
}
