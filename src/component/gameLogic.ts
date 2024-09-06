import * as THREE from "three";
import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";
import { Sea } from "../customObjects/sea";
import { Iceberg } from "../customObjects/obstacle";
import { Return } from "three/webgpu";
import { clamp } from "../utils";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

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
    private playerSigned: boolean = false;

    private timer: number = 0;

    private obstacleTimer: number = 0;
    private obstacleSpawnRate: number = 5;

    private mainMenu!: MainMenu;
    private sea!: Sea;
    
    /**       debugging stuff       */
    private debugModeOn: boolean = false;
    private obstacleSpawnedDebug: number = 0;
    /** --------------------------- */

    constructor() {
        super("GameLogic");
    }

    public start() {
        this.gameState = GameState.IDLE;
        this.mainMenu = this.findEntityByTag("mainMenu") as MainMenu;
        this.sea = this.findEntityByTag("sea") as Sea;

        this.processAuth();
    }

    override update(deltaTime: number): void {
        if (this.gameState === GameState.PLAYING) {
            // increment timer per second
            this.timer += deltaTime;
            // update the current score
            this.currentScore = Math.round(this.timer / 10);
            // update the timer on the UI
            this.mainMenu.updateScore(this.currentScore);

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

    async processAuth() {
          if (await this.isPlayerAuthorized()) {
            
            this.mainMenu.hideAuthModal();
            console.log("Player is authorized");

            if (await this.checkPlayerSignature()) {
                
                this.mainMenu.hideSigModal();
                console.log("Player has signed");
                this.mainMenu.authDone();
            
            } else {
                
                console.log("Player has not signed");
                this.mainMenu.showSigModal();
            
            }
        }
        else 
        {
            this.mainMenu.showAuthModal();
        }
    }

    isPlayerAlreadyLoggedIn() {
        return this.playerName !== "" || this.highScore !== 0;
    }

    // check this for potential bugs @tyron
    async isPlayerAuthorized() {
        
        if (this.isPlayerAlreadyLoggedIn())
            return true;

        interface Response {
            status: string,
            message: string,
            user_data: {
                username: string,
                name: string,
                email: string,
                student_id: string,
                top_score: number
            }
        }

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        let isVerified = false;

        await axios.post("http://localhost:5173/api/v1/player/checkToken", {}, config)
            .then((response) => {
                const data = response.data as Response;
                console.log(data);
                if (data.status === "verified") {

                    this.playerName = data.user_data.username;
                    this.highScore = data.user_data.top_score;

                    isVerified = true;
                } else {
                    isVerified = false;
                }
            })
            .catch((error) => {
                console.log(error);
            });

        return isVerified;
    }

    // check this for potential bugs @tyron
    async checkCode(code: string) {

        if (this.isPlayerAlreadyLoggedIn())
            return true;
        
        interface Response {
            status: string,
            message: string,
            user_data: {
                username: string,
                name: string,
                email: string,
                student_id: string,
                top_score: number
            }
        }

        interface Request {
            code: string
        }

        const request: Request = {
            code: code
        }

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        let isVerified = false;

        await axios.post("http://localhost:5173/api/v1/player/verifyCode", request, config)
            .then((response) => {
                const data = response.data as Response;
                console.log(data);
                if (data.status === "verified") {
                    
                    this.playerName = data.user_data.username;
                    this.highScore = data.user_data.top_score;
                    
                    isVerified = true;
                } else {
                    isVerified = false;
                }
            })
            .catch((error) => {
                console.log(error);
            });
            
        return isVerified;
    }

    async checkSig() {
        if (this.hasPlayerSigned())
            return true;
        
        interface Response {
            status: string,
            message: string
        }

        interface Request {
            code: string
        }

        const request: Request = {
            code: ''
        }

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        let isVerified = false;

        await axios.post("http://localhost:5173/api/v1/player/submitSignature", request, config)
            .then((response) => {
                const data = response.data as Response;
                console.log(data);
                if (data.status === "verified") {
                    
                    this.playerSigned = true;

                    isVerified = true;
                } else {
                    isVerified = false;
                }
            })
            .catch((error) => {
                console.log(error);
            });
            
        return isVerified;
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

        this.mainMenu.updateDebugString(debugString);
    }

    isDebugModeOn() {
        return this.debugModeOn;
    }

    getCurrentScore() {
        return this.currentScore;
    }

    hasPlayerSigned() {
        return this.playerSigned;
    }

    async checkPlayerSignature()
    {
        if (this.hasPlayerSigned())
            return true;

        interface Response {
            status: string,
            message: string
        }

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        let hasPlayerSigned = false;

        await axios.post("http://localhost:5173/api/v1/player/signatureCheck", {}, config)
            .then((response) => {
                const data = response.data as Response;
                console.log(data);
                if (data.status === "signed") {
                    hasPlayerSigned = true;
                    this.playerSigned = true;
                } else {
                    hasPlayerSigned = false;
                }
            })
            .catch((error) => {
                console.log(error);
            });

        return hasPlayerSigned;
    }
}
