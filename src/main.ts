

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';

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

setupLighting(engine);

engine.start();





