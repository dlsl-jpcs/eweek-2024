import { Entity } from "../engine/engine";
import * as THREE from "three";

export default class Dolphin extends Entity {
    constructor() {
        super("dolphin");

        this.object = new THREE.Object3D();


    }

    update(_deltaTime: number): void {

    }
}