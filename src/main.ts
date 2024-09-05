

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat, BoatMarker } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';
import { Iceberg } from './customObjects/obstacle';
import { GameLogic } from './component/gameLogic';
import { MainMenu } from './component/mainMenu';

import * as THREE from 'three';


const engine = new Engine();

let mainMenu = new MainMenu();
engine.addEntity(mainMenu);

let gameLogic = new GameLogic();
engine.addEntity(gameLogic);



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

/// THINGS SUBJECT TO CLEANUP, I'LL PUT THEM HERE CAUSE I'M LAZY FOR NOW
/// -- COFFEE

/** mesh position guide */
/** for x, negative means up, positive means down
  *  for y, negative means down, positive means up
  * for z, negative means right, positive means left 
*/


// an attempt for a ui?

const w = document.getElementById('ui');

/*const p = document.createElement('p');
p.textContent = 'Hello three.js!';
p.style.zIndex = '100';*/

//w?.appendChild(p);

engine.init();


/// ------ END OF COFFEE'S DIRTY ASS SPAGHETTI CODE ------

setupLighting(engine);

engine.start();

