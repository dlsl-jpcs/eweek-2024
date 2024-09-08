import { Entity } from "../engine/engine";
import * as THREE from "three";
import { DOLPHIN, getModel } from "../utils/resource";

export default class Dolphin extends Entity {
    constructor() {
        super("dolphin");

        this.object = new THREE.Object3D();


    }

    update(deltaTime: number): void {

    }
}