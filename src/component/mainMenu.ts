import { Entity } from "../engine/engine";
import { GameLogic, GameState } from "./gameLogic";


export class MainMenu extends Entity {

    private gameLogic!: GameLogic;

    private ui!: HTMLElement;
    private gameStartThings!: HTMLElement;
    private scoreVal!: HTMLElement;
    private vignette!: HTMLElement;
    private blur!: HTMLElement;
    private tapToPlayLabel!: HTMLElement;
    private authModal!: HTMLElement;
    
    private debugString!: HTMLElement;

    constructor() {
        super("mainMenu");
    }

    public start(): void {
        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;


        this.ui = document.getElementById("ui")!;
        this.gameStartThings = document.getElementById("game_start_things")!;

        this.vignette = document.getElementById("vignette")!;
        this.blur = document.getElementById("blur")!;
        this.tapToPlayLabel = document.getElementById("tap_to_play_label")!;
        this.authModal = document.getElementById("auth_box")!;

        this.scoreVal = document.getElementById("scoreVal")!;

        this.debugString = document.getElementById("debugString")!;

       /* document.addEventListener("click", () => {
            this.authDone();
        });*/
    }


    update(deltaTime: number): void {

    }

    updateScore(score: number) {
        this.scoreVal.textContent = Math.round(score).toString();
    }

    updateDebugString(debugString: string) {
        this.debugString.innerHTML = debugString;
    }

    /**
        // listen for tap events, when the screen is tapped, we start the game
        document.addEventListener("click", () => {
            console.log(this.gameLogic.getGameState());
            if (this.gameLogic.getGameState() === GameState.IDLE) {
                this.gameLogic.setGameState(GameState.PLAYING);

                this.scoreVal.style.opacity = "1";
                this.gameStartThings.style.opacity = "0";
                this.vignette.style.opacity = "0";
            }
        }); */

    authDone() {
        this.blur.id = "done_blur";
        this.authModal.style.opacity = "0";
        this.tapToPlayLabel.style.opacity = "1";
    }
    
}