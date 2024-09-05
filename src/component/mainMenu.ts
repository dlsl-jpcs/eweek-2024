import { Entity } from "../engine/engine";
import { GameLogic, GameState } from "./gameLogic";


export class MainMenu extends Entity {

    private gameLogic!: GameLogic;

    private ui!: HTMLElement;
    private gameStartThings!: HTMLElement;
    private scoreVal!: HTMLElement;

    constructor() {
        super("mainMenu");
    }

    public awake(): void {
        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;

        this.ui = document.getElementById("ui")!;
        this.gameStartThings = document.getElementById("game_start_things")!;

        this.scoreVal = document.getElementById("scoreVal")!;

        // listen for tap events, when the screen is tapped, we start the game
        document.addEventListener("click", () => {
            if (this.gameLogic.getGameState() === GameState.IDLE) {
                this.gameLogic.setGameState(GameState.PLAYING);

                this.scoreVal.style.opacity = "1";
                this.gameStartThings.style.opacity = "0";
            }
        });
    }


    update(deltaTime: number): void {

    }

    updateScore(timer: number) {
        this.scoreVal.textContent = Math.round(timer).toString();
    }
}