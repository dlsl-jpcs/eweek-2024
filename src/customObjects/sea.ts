import * as THREE from 'three';
import {
    BufferGeometryUtils
} from 'three/examples/jsm/Addons.js';
import { Entity } from '../engine/engine';

export type Wave = {
    y: number,
    x: number,
    z: number,
    ang: number,
    amp: number,
    speed: number
}

/**
 * Just a giant rotating cylinder where each vertex is moved up and down :D
 */
export class Sea extends Entity {
    waves: Wave[];
    mesh: THREE.Mesh;

    constructor() {
        super("sea");

        var geom = new THREE.CylinderGeometry(
            600 /** radius top */,
            600 /** radius bottom */,
            800 /** height */,
            40 /** radius segments */,
            10 /** height segments */,
        );

        // we rotate the cyclinder to the right, so it looks like a sea
        geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        // important: by merging vertices we ensure the continuity of the waves

        let merged = BufferGeometryUtils.mergeVertices(geom,
            20);
        // let merged = geom;
        // // get the vertices
        const position = merged.attributes.position;

        const length = position.count;


        this.waves = [];

        // we get each vertex of the cylinder, and add a random value associated to it
        // this will be used later on #moveWaves
        for (var i = 0; i < length; i++) {
            // store some data associated to it
            const vec = new THREE.Vector3().fromBufferAttribute(position, i);
            this.waves.push({
                x: vec.x,
                y: vec.y,
                z: vec.z,
                // a random angle
                ang: Math.random() * Math.PI * 2,
                // a random distance
                amp: 5 + Math.random() * 15,
                // a random speed between 0.016 and 0.048 radians / frame
                speed: 0.016 + Math.random() * 0.032
            });
        };

        var mat = new THREE.MeshPhongMaterial({
            color: "#68c3c0",
            transparent: true,
            opacity: .8,
            flatShading: true,
        });



        const mesh = new THREE.Mesh(merged, mat);
        mesh.receiveShadow = true;

        this.object = mesh;
        this.mesh = mesh;
    }

    moveWaves() {
        // get the vertices
        var verts = this.mesh.geometry.attributes.position;



        for (var i = 0; i < verts.count; i++) {
            // get the data associated to it
            var vprops = this.waves[i
            ];

            verts.setX(i, vprops.x + Math.cos(vprops.ang) * vprops.amp);

            // update the position of the vertex
            verts.setY(i, vprops.y + Math.sin(vprops.ang) * vprops.amp);

            // increment the angle for the next frame
            vprops.ang += vprops.speed;
        }
        // Tell the renderer that the geometry of the sea has changed.
        // In fact, in order to maintain the best level of performance, 
        // three.js caches the geometries and ignores any changes
        // unless we add this line
        this.mesh.geometry.attributes.position.needsUpdate = true;

        // this.mesh.rotation.z -= .005;
    }

    update(deltaTime: number): void {
        this.mesh.rotation.z -= .002;

        this.moveWaves();
    }
}