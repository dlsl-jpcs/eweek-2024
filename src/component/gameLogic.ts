import * as THREE from "three";
import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";
import { Sea } from "../customObjects/sea";
import { Iceberg } from "../customObjects/obstacle";

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

    private obstacleTimer: number = 0;
    private obstacleSpawnRate: number = 10;




    private mainMenu!: MainMenu;
    private sea!: Sea;

    constructor() {
        super("GameLogic");


    }

    public start(): void {
        this.gameState = GameState.IDLE;
        this.mainMenu = this.findEntityByTag("mainMenu") as MainMenu;
        this.sea = this.findEntityByTag("sea") as Sea;
    }



    override update(deltaTime: number): void {
        if (this.gameState === GameState.PLAYING) {
            // increment timer per second
            this.timer += deltaTime;


            // update the timer on the UI
            this.mainMenu.updateTimer(this.timer);


            // spawn obstacles
            this.spawnObstacle();
        }
    }

    /**
     * Called every frame, responsible for spawning obstacles at random
     */
    spawnObstacle() {
        this.obstacleTimer += 0.01;

        if (this.obstacleTimer > this.obstacleSpawnRate) {
            this.obstacleTimer = 0;

            const iceberg = this.engine.instantiate(Iceberg);
            iceberg.object.position.set(-300, 0, 0)

            const width = this.sea.getWidth() / 2;
            const lowerBound = -width;
            const upperBound = width;

            const randomZ = Math.random() * (upperBound - lowerBound) + lowerBound;
            iceberg.object.position.z = randomZ;
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
