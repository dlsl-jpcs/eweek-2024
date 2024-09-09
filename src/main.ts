
import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat, BoatMarker } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';
import { GameLogic } from './component/gameLogic';
import { MainMenu } from './component/mainMenu';

import { preloadAssets, registerOnLoadCallback, registerOnProgressCallback } from './utils/resource';
import { PowerUpSpawner } from './customObjects/powerup/PowerUpSpawner';
import { DayNightCycle } from './component/dayNightCycle';


async function main() {
  const loadingScreen = document.getElementById("loading_screen");

  registerOnLoadCallback(() => {
    initEngine();


    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
    }
  });

  registerOnProgressCallback((url, loaded, total) => {
    if (loadingScreen) {
      const progress = (loaded / total) * 100;
      loadingScreen.style.width = `${progress}%`;
    }

    const loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.innerText = `Loading ${url}`;
    }


  });


  preloadAssets();
}

function initEngine() {
  const engine = new Engine();

  engine.instantiate(MainMenu);
  engine.instantiate(GameLogic);

  engine.instantiate(Sea);
  engine.instantiate(Boat);

  engine.instantiate(BoatMarker);
  engine.instantiate(BoatMarker, true);


  engine.instantiate(PowerUpSpawner);
  engine.instantiate(DayNightCycle);


  engine.init();
  setupLighting(engine);

  engine.start();

}

main();