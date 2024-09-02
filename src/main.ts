

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';
import { Iceberg } from './customObjects/obstacle';


const engine = new Engine();


let sea = new Sea();
sea.mesh.position.y = -600;
engine.addEntity(sea);

let loader = new GLTFLoader();
let boat: Boat;
loader.load('/sailboat.glb', (gltf) => {
  boat = new Boat(gltf.scene);
  boat.mesh.position.y = 0;
  boat.mesh.position.x = -100;
  engine.addEntity(boat);
});

let iceberg: Iceberg; 
loader.load('./iceberg.glb', (gltf) => {
    iceberg = new Iceberg(gltf.scene);
    iceberg.mesh.position.y = -60;
    iceberg.mesh.position.x = -300;
    iceberg.mesh.position.z = 200;
    engine.addEntity(iceberg); 
});

setupLighting(engine);

engine.start();





