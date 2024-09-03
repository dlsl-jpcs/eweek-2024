

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat, BoatMarker } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';
import { Iceberg } from './customObjects/obstacle';


const engine = new Engine();


let sea = new Sea();
sea.mesh.position.y = -600;
engine.addEntity(sea);

let loader = new GLTFLoader();

const boatModel = await loader.loadAsync('/sailboat.glb');
let boat = new Boat(boatModel.scene);
boat.mesh.position.y = 100;
boat.mesh.position.x = -100;

engine.addEntity(boat);

// TODO: Probably add an IcebergGenerator class that generates icebergs
let iceberg: Iceberg;
loader.load('./iceberg.glb', (gltf) => {
  iceberg = new Iceberg(gltf.scene);
  iceberg.mesh.position.y = -60;
  iceberg.mesh.position.x = -300;
  iceberg.mesh.position.z = 200;
  // disable this temporarily
  // engine.addEntity(iceberg);
});

engine.addEntity(new BoatMarker());
engine.addEntity(new BoatMarker(true));

setupLighting(engine);

engine.start();




