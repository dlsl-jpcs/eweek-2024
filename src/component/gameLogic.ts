import { Entity } from "../engine/engine";
import { MainMenu } from "./mainMenu";
import { Sea } from "../customObjects/sea";
import { Obstacle } from "../customObjects/obstacle";
import { codeCheck, signatureCheck, submitSignature, tokenCheck, PlayerData } from "../auth";
import { Boat } from "../customObjects/boat";
import { getOrientationPermissionState } from "../utils";
import { Powerup } from "../customObjects/powerup/powerup";

export enum GameState {
    IDLE,
    PAUSED,
    OVER,
    PLAYING,
}

export enum Control {
    TOUCH,
    MOUSE,
    KEYBOARD
}

export class GameLogic extends Entity {
    private playerData: PlayerData = {
        username: "",
        top_score: 0,
        id: 0,
        name: "",
        email: "",
        student_id: "",
        is_facilitator: false,
        course: "",
        section: "",
        code: "",
    };

    private currentScore: number = 0;
    private gameState: GameState = GameState.IDLE;

    private timer: number = 0;

    private obstacleTimer: number = 0;
    private obstacleSpawnRate: number = 2;

    private mainMenu!: MainMenu;
    private sea!: Sea;
    private player!: Boat;

    /**       debugging stuff       */
    private debugModeOn: boolean = true;
    private obstacleSpawnedDebug: number = 0;
    private speedModifier!: ((speed: number) => number) | undefined;
    /** --------------------------- */

    constructor() {
        super("GameLogic");
    }

    public start() {
        this.gameState = GameState.IDLE;
        this.mainMenu = this.findEntityByTag("mainMenu") as MainMenu;
        this.sea = this.findEntityByTag("sea") as Sea;
        this.player = this.findEntityByTag("player") as Boat;

        this.checkPermissions();
    }

    async checkPermissions() {

        const permission = await getOrientationPermissionState();
        if (permission === 'prompt') {
            this.mainMenu.showPermissionsModal();
            return;
        } else if (permission === 'denied') {
            this.mainMenu.hidePermissionsModal();
            this.mainMenu.showAlternateControlsModal();
            return;
        }

        // granted

        this.mainMenu.hidePermissionsModal();
        this.processAuth();
    }



    override update(deltaTime: number): void {
        if (this.gameState === GameState.PLAYING) {
            // increment timer per second
            this.timer += deltaTime;
            // update the current score
            this.currentScore = this.timer;
            // update the timer on the UI
            this.mainMenu.updateScore(this.currentScore * 10);

            this.sea.setSpeed(this.getSpeed());

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

            if (this.isDebugModeOn()) {
                this.obstacleSpawnedDebug++;
            }

            const obstacle = this.engine.instantiate(Obstacle);
            // iceberg.object.position.set(-300, 0, 0)

            const width = this.sea.getWidth() / 2 - 200;
            const lowerBound = -width;
            const upperBound = width;

            const randomZ = Math.random() * (upperBound - lowerBound) + lowerBound;
            obstacle.mesh.position.z = randomZ;
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
        else {
            this.mainMenu.showAuthModal();
        }
    }

    async checkPlayerSignature() {
        return await signatureCheck().then((result) => {
            return result;
        });
    }

    isPlayerAlreadyLoggedIn() {
        return this.getPlayerData().student_id !== "";
    }

    // check this for potential bugs @tyron
    async isPlayerAuthorized() {

        if (this.isPlayerAlreadyLoggedIn()) {
            return true;
        }

        const result = await tokenCheck().catch(() => null);
        if (result) {
            this.playerData = result;
            return true;
        }
    }

    // check this for potential bugs @tyron
    async checkCode(code: string) {

        if (this.isPlayerAlreadyLoggedIn()) {
            return true;
        }

        return codeCheck(code).catch(() => false);
    }

    async checkSig(signatureBase64: string) {
        return submitSignature(signatureBase64).then((result) => {
            return result;
        });
    }

    getGameState() {
        return this.gameState;
    }

    setGameState(state: GameState) {
        this.gameState = state;

        if (state === GameState.PLAYING) {
            // remove obstacles, reset timer
            const obstacles = this.engine.findEntitiesByType(Obstacle);
            for (const obstacle of obstacles) {
                obstacle.destroy();
            }

            const powerups = this.engine.findEntitiesByType(Powerup);
            for (const powerup of powerups) {
                powerup.destroy();
            }

            this.obstacleTimer = 0;
            this.timer = 0;
            this.currentScore = 0;
            this.player.enableControls();
            this.player.reset();

            this.sea.setSpeed(this.getSpeed());
        } else if (state === GameState.OVER) {
            this.sea.setSpeed(0);
            this.player.disableControls();
            this.mainMenu.showGameOver();
        }
    }

    getSpeed() {
        if (this.speedModifier !== undefined) {
            return this.speedModifier(this.timer);
        }

        return .3 + this.timer * 0.001;
    }

    setSpeedModifier(func: (speed: number) => number) {
        this.speedModifier = func;
    }

    removeSpeedModifier() {
        this.speedModifier = undefined;
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
        debugString += `Speed: ${this.getSpeed()}<br>`;
        debugString += `Current Score: ${this.currentScore}<br>`;
        debugString += `High Score: ${this.getPlayerData().top_score}<br><br>`;

        debugString += `[Player] <br>`;
        debugString += `Pos x: ${this.player.object.position.x}<br>`;
        debugString += `Pos y: ${this.player.object.position.y}<br>`;
        debugString += `Pos z: ${this.player.object.position.z}<br>`;
        debugString += `<br>`;

        debugString += `Player First Name: ${this.getPlayerData().username}<br>`;
        debugString += `Player Name: ${this.getPlayerData().name}<br>`;
        debugString += `Player ID: ${this.getPlayerData().id}<br>`;
        debugString += `Player Email: ${this.getPlayerData().email}<br>`;
        debugString += `Player Student ID: ${this.getPlayerData().student_id}<br>`;
        debugString += `Player Course: ${this.getPlayerData().course}<br>`;
        debugString += `Player Section: ${this.getPlayerData().section}<br>`;
        debugString += `Player Code: ${this.getPlayerData().code}<br><br>`;

        debugString += `[Power Ups] <br>`
        const powerups = this.engine.findEntitiesByType(Powerup);
        const powerupSpawner = this.engine.findEntityByTag("PowerUpSpawner")!;
        debugString += `Spawned Powerups: ${powerups.length}<br>`;

        debugString += `<br>`;
        debugString += `[Active Powerups] <br>`;
        for (const powerup of this.player.activePowerups) {
            debugString += `${powerup.constructor.name} <br>`;
            debugString += `Duration: ${powerup.getDuration()} <br>`;
            debugString += `Timer: ${powerup.timer} <br>`;
        }


        this.mainMenu.updateDebugString(debugString);
    }

    isDebugModeOn() {
        return this.debugModeOn;
    }

    getCurrentScore() {
        return this.currentScore;
    }

    getPlayerData() {
        return this.playerData;
    }

}
