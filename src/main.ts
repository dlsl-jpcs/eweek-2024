
import './style.css';
import Engine from './engine/engine';
import { Sea } from './customObjects/sea';
import { Boat, BoatMarker } from './customObjects/boat';
import { setupLighting } from './customObjects/lights';
import { GameLogic } from './component/gameLogic';
import { MainMenu } from './component/mainMenu';

import { preloadAssets } from './utils/resource';

// ASSET PRELOAD
// TODO: Loading screen ?
await preloadAssets();


const engine = new Engine();

engine.instantiate(MainMenu);

engine.instantiate(GameLogic);



engine.instantiate(Sea);

engine.instantiate(Boat);


engine.instantiate(BoatMarker);
engine.instantiate(BoatMarker, true);


engine.init();


/// ------ END OF COFFEE'S DIRTY ASS SPAGHETTI CODE ------

setupLighting(engine);

engine.start();

