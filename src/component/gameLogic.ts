import * as THREE from "three";
import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";
import { Sea } from "../customObjects/sea";
import { Iceberg } from "../customObjects/obstacle";
import { Return } from "three/webgpu";
import { clamp } from "../utils";

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
    private obstacleSpawnRate: number = 5;

    private mainMenu!: MainMenu;
    private sea!: Sea;
    
    /**       debugging stuff       */
    private debugModeOn: boolean = true;
    private obstacleSpawnedDebug: number = 0;
    /** --------------------------- */

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
            this.mainMenu.updateScore(this.timer);
            // update the current score
            this.currentScore = Math.round(this.timer);

            // spawn obstacles
            this.spawnObstacle(deltaTime);
        }
        
        // update debug logs
        this.updateDebugLogs();
    }

    /**
     * Called every frame, responsible for spawning obstacles at random
     */
    spawnObstacle(deltaTime: number) {
        this.obstacleTimer += 1.0 * deltaTime;

        if (this.obstacleTimer > this.obstacleSpawnRate) {
            this.obstacleTimer = 0;

            if (this.isDebugModeOn())
            {
                this.obstacleSpawnedDebug++;
            }

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

    updateDebugLogs() {
        if (!this.isDebugModeOn())
            return;

        let debugString = `[Debug Logs]<br>`;
        debugString += `Obstacles Spawned: ${this.obstacleSpawnedDebug}<br>`;
        debugString += `Obstacle Spawn Rate: ${this.obstacleSpawnRate}<br>`;
        debugString += `Obstacle Timer: ${this.obstacleTimer}<br>`;
        debugString += `Game State: ${GameState[this.gameState]}<br>`;
        debugString += `Timer: ${this.timer}<br>`;
        debugString += `Current Score: ${this.currentScore}<br>`;
        debugString += `High Score: ${this.highScore}<br>`;
        debugString += `Player Name: ${this.playerName}<br>`;
        debugString += `Auth Token: ${this.authToken}<br>`;

        this.mainMenu.updateDebugString(debugString);
    }

    isDebugModeOn() {
        return this.debugModeOn;
    }
}
