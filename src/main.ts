

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



const engine = new Engine();


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

/*const geometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed
const plane = new THREE.Mesh(geometry);
plane.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Adjust color as needed
plane.position.set(-450, 0, 0); 
plane.scale.set(1, 1, 1); 

// reverse camera rotation. is there an easier way to do this??
plane.rotation.x = -Math.PI / 2; 
plane.rotation.y = Math.PI / 6;*/


//engine.getCurrentScene().add(plane);


// an attempt for a ui?

const w = document.getElementById('ui');

/*const p = document.createElement('p');
p.textContent = 'Hello three.js!';
p.style.zIndex = '100';*/

//w?.appendChild(p);



/// ------ END OF COFFEE'S DIRTY ASS SPAGHETTI CODE ------

setupLighting(engine);

engine.start();

