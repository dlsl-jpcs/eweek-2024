import * as THREE from "three";
import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";

export enum GameState {
    IDLE = 0,
    STARTED = 1,
    PAUSED = 2,
    OVER = 3,
}

class GameLogic extends Entity {
    private currentScore: number = 0;
    private highScore: number = 0;
    private playerName: string = "";
    private gameState: GameState = GameState.IDLE;
    private authToken: string = "";


    // private mainMenu!: MainMenu;

    constructor() {
        super("GameLogic");
    }

    public awake(): void {
        this.gameState = GameState.IDLE;

        // this.mainMenu = new MainMenu();

        console.log("GameLogic awake");
        // console.log(this.mainMenu);
    }



    override update(deltaTime: number): void {

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
