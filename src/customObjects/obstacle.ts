import * as THREE from "three";
import { Entity } from "../engine/engine";


//Iceberg
export class Iceberg extends Entity{
    
    mesh: THREE.Object3D;

    zPosition: number = 0;
    xPosition: number = 0;
    zDirection: number = 1; // 1 for moving forward, -1 for moving backward
    xDirection: number = 1; // 1 for moving right, -1 for moving left
    
    constructor(mesh: THREE.Object3D){
        super("iceberg");

        this.mesh = mesh;
        this.mesh.scale.set(15,
            15,
            15);

        this.object = this.mesh;
    }



    update(deltaTime: number): void {
        this.mesh.position.z = this.zPosition;
        if (this.zPosition >= 200) {
            this.zDirection = -1;
        } else if (this.zPosition <= -200) {
            this.zDirection = 1;
        }
        this.zPosition += this.zDirection;

    }
}