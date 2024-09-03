import * as THREE from "three";
import { Entity } from "../engine/engine";

enum GameState {
    IDLE = 0,
    STARTED = 1,
    PAUSED = 2,
    OVER = 3,
}

class GameLogic {
    private currentScore: number = 0;
    private highScore: number = 0;
    private playerName: string = "";
    private gameState: GameState = GameState.IDLE;
    private authToken: string = "";

    constructor() {
        this.init();
    }

    init() {
      
    }
    
    update(deltaTime: number): void {
        
    }

    processPlayerAuth(token: string) {
        /**
            here is where we verify auth etc
         */
    }

    isPlayerAuthorized() {
        if (this.authToken.length < 0)
            return false;

        /**
            verification logic here,
            in order to be verified, player must be given a code by us,
            where we will be the ones to input their names for a specific token,
            so after they input their token or code, it asks the api for their name,
            information etc which their client will use for subsequent requests
         */

        return true;
    }

    getGameState() {
        return this.gameState;
    }
}

// access gamelogic via here! wow a singleton?
// we use singletons in javascript now yes yes? kidding.
export const gameLogic = new GameLogic();
