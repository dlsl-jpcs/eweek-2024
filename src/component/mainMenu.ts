import { Boat } from "../customObjects/boat";
import { Entity } from "../engine/engine";
import { GameLogic, GameState } from "./gameLogic";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class MainMenu extends Entity {

    private gameLogic!: GameLogic;

    private ui!: HTMLElement;
    private gameStartThings!: HTMLElement;
    private scoreVal!: HTMLElement;
    private vignette!: HTMLElement;
    private blur!: HTMLElement;
    private tapToPlayLabel!: HTMLElement;

    private authModal!: HTMLElement;
    private sigModal!: HTMLElement;
    
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
        this.sigModal = document.getElementById("sig_box")!; 

        this.scoreVal = document.getElementById("scoreVal")!;

        this.debugString = document.getElementById("debugString")!;

        this.registerCodeSubmitListener();
        this.registerSigSubmitListener();
    }

    update(deltaTime: number): void {

    }

    updateScore(score: number) {
        this.scoreVal.textContent = Math.round(score).toString();
    }

    updateDebugString(debugString: string) {
        this.debugString.innerHTML = debugString;
    }
    
    registerCodeSubmitListener() {
        const submitCodeButton = document.getElementById("submit_code")!;
        submitCodeButton.addEventListener("click", async () => {
            const codeInput = document.getElementById("auth_code") as HTMLInputElement;
            if (await this.gameLogic.checkCode(codeInput.value)) {
                
            }

            this.gameLogic.processAuth();
        });
    }

    registerSigSubmitListener() {
        const submitSigButton = document.getElementById("submit_sig")!;
        submitSigButton.addEventListener("click", async () => {
            if (await this.gameLogic.checkSig()) {
                // temporary
                this.hideSigModal();
                console.log("Player has signed");
                this.authDone();  
            }

            //this.gameLogic.processAuth();
        });
    }

    // secure this
    authDone() {
        this.blur.id = "done_blur";
        this.tapToPlayLabel.style.opacity = "1";

        // wait so clicking menu won't start game once auth done
        setTimeout(() =>
        { 
            document.addEventListener("click", () => {
            console.log(this.gameLogic.getGameState());
                
            let boat = this.engine.findEntityByTag("player")! as Boat;
            if (boat) {
                boat.enableControls();
            }

            if (this.gameLogic.getGameState() === GameState.IDLE) {
                this.gameLogic.setGameState(GameState.PLAYING);

                this.scoreVal.style.opacity = "1";
                this.gameStartThings.style.opacity = "0";
                this.vignette.style.opacity = "0";
            }
        });

        }, 500);
        
        
    }

    showAuthModal() {
        this.authModal.style.display = "flex";
    }

    hideAuthModal() {
        this.authModal.style.display = "none";
    }

    showSigModal() {
        this.sigModal.style.display = "flex";
    }

    hideSigModal() {
        this.sigModal.style.display = "none";
    }
}