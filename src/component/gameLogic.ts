import * as THREE from "three";
import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";
import { Sea } from "../customObjects/sea";

export enum GameState {
    IDLE,
    PAUSED,
    OVER,
    PLAYING,
}

export class GameLogic extends Entity {
    private currentScore: number = 0;
    private highScore: number = 0;
    private playerName: string = "";
    private gameState: GameState = GameState.IDLE;
    private authToken: string = "";

    private timer: number = 0;




    private mainMenu!: MainMenu;
    private sea!: Sea;

    constructor() {
        super("GameLogic");
    }

    public awake(): void {
        this.gameState = GameState.IDLE;
        this.mainMenu = this.findEntityByTag("mainMenu") as MainMenu;
        this.sea = this.findEntityByTag("sea") as Sea;
    }



    override update(deltaTime: number): void {
        if (this.gameState === GameState.PLAYING) {
            // increment timer per second
            this.timer += deltaTime;
            // update the timer on the UI
            this.mainMenu.updateScore(this.timer);
        }
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

    setGameState(state: GameState) {
        this.gameState = state;

        if (state === GameState.PLAYING) {
            this.currentScore = 0;
            this.sea.setSpeed(0.5);
        }
    }
}
