import * as THREE from 'three';
import Engine from '../engine/engine';

export let hemisphereLight: THREE.HemisphereLight;
export let shadowLight: THREE.DirectionalLight;
export let ambientLight: THREE.AmbientLight;


export function setupLighting(engine: Engine) {
    const scene = engine.getCurrentScene();

    // A hemisphere light is a gradient colored light; 
    // the first parameter is the sky color, the second parameter is the ground color, 
    // the third parameter is the intensity of the light



    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,
        0x000000, .9);

    const startColor = new THREE.Color(0x000000);
    hemisphereLight.color = startColor;

    // an ambient light modifies the global color of a scene and makes the shadows softer
    ambientLight = new THREE.AmbientLight("#dc8874",
        1);
    scene.add(ambientLight);

    // A directional light shines from a specific direction. 
    // It acts like the sun, that means that all the rays produced are parallel. 
    shadowLight = new THREE.DirectionalLight(0xffffff,
        15);

    // Set the direction of the light  
    shadowLight.position.set(150,
        350,
        350);

    // Allow shadow casting 
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the higher the better, 
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

