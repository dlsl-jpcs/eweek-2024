import * as THREE from "three";
import { Entity } from "../engine/engine";
import { getModel, ICEBERG, ISLAND } from "../utils/resource";
import { Sea } from "./sea";


export class Obstacle extends Entity {

    mesh: THREE.Object3D;


    private sea!: Sea;

    obstacleMesh!: THREE.Object3D;

    constructor() {
        super("obstacle");

        this.mesh = new THREE.Object3D();
        this.object = this.mesh;

        // 0

        const toRadians = (angle: number) => angle * Math.PI / 180;
        const angle = toRadians(200);

        const distance = 600;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const iceberg = getModel(ISLAND).scene.clone();

        iceberg.scale.set(1, -1, 1);
        iceberg.position.set(x, y + 100, 0);
        iceberg.rotation.z = angle + Math.PI / 2;

        this.mesh.add(iceberg);
        this.mesh.position.y = -600;

        const collisionBox = new THREE.Box3().setFromObject(iceberg);
        collisionBox.min.y += 200;
        collisionBox.min.x += 50;
        collisionBox.max.x -= 100;
        collisionBox.min.z += 20;
        collisionBox.max.z -= 20;
        const box = new THREE.Box3Helper(collisionBox, 0xfffe6262);
        this.obstacleMesh = box;

        this.mesh.add(box);
    }


    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea
    }

    public onDestroy(): void {
        this.engine.getCurrentScene().remove(this.obstacleMesh);
    }


    update(deltaTime: number): void {
        this.mesh.rotation.z -= this.sea.getSpeed() * deltaTime;

        if (this.mesh.rotation.z < -2.2) {
            this.destroy();
        }
    }

    getCollisionBox(): THREE.Box3 {
        return new THREE.Box3().setFromObject(this.obstacleMesh);
    }
}