import { Boat } from "../customObjects/boat";
import { Entity } from "../engine/engine";
import { allowEntryOnMaintenance, isMaintenanceModeOn, requestOrientationPermissions } from "../utils";
import { GameLogic, GameState } from "./gameLogic";

export class MainMenu extends Entity {

    private gameLogic!: GameLogic;

    private gameStartThings!: HTMLElement;
    private scoreVal!: HTMLElement;
    private vignette!: HTMLElement;
    private blur!: HTMLElement;
    private tapToPlayLabel!: HTMLElement;
    private lastScoreLabel!: HTMLElement;
    private newRecordLabel!: HTMLElement

    private authModal!: HTMLElement;
    private sigModal!: HTMLElement;

    private authError!: HTMLElement;
    private sigError!: HTMLElement;

    private permissionsModal!: HTMLElement;

    private alternateControlsModal!: HTMLElement;

    private debugString!: HTMLElement;

    private isTapToPlayRegistered: boolean = false;

    constructor() {
        super("mainMenu");
    }

    public start(): void {
        this.gameLogic = this.findEntityByTag("GameLogic") as GameLogic;

        this.gameStartThings = document.getElementById("game_start_things")!;

        this.vignette = document.getElementById("vignette")!;
        this.blur = document.getElementById("blur")!;
        this.tapToPlayLabel = document.getElementById("tap_to_play_label")!;
        this.authModal = document.getElementById("auth_box")!;
        this.sigModal = document.getElementById("sig_box")!;
        this.permissionsModal = document.getElementById("permissions_box")!;
        this.alternateControlsModal = document.getElementById("alternate_controls_box")!;

        this.lastScoreLabel = document.getElementById("last_score_label")!;
        this.newRecordLabel = document.getElementById("new_record_label")!;

        this.hidePermissionsModal();
        this.hideAlternateControlsModal();

        document.getElementById("grant_permissions")!.addEventListener("click", async () => {
            const result = await requestOrientationPermissions();
            if (result === "granted") {
                this.hidePermissionsModal();
                this.gameLogic.processAuth();
                return;
            }

            if (result === "denied") {
                // show alternate controls
                this.showAlternateControlsModal();
                this.hidePermissionsModal();
                return;
            }
        });

        document.getElementById("alternate_okay")!.addEventListener("click", () => {
            this.hideAlternateControlsModal();
            this.gameLogic.processAuth();
        });

        this.authError = document.getElementById("auth_err")!;
        this.sigError = document.getElementById("sig_err")!;

        this.scoreVal = document.getElementById("scoreVal")!;

        this.debugString = document.getElementById("debugString")!;

        this.registerCodeSubmitListener();
        this.registerSigSubmitListener();

        this.showPermissionsModal();

        if (isMaintenanceModeOn()) {
            if (!allowEntryOnMaintenance()) {
                window.location.href = "maintenance.html";
            }
        }

        this.registerWebpageAntiCheat();
    }

    update(_deltaTime: number): void {

    }

    updateScore(score: number) {
        this.scoreVal.textContent = Math.round(score).toString();
    }

    updateDebugString(debugString: string) {
        this.debugString.innerHTML = debugString;
    }

    registerWebpageAntiCheat() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState == 'hidden') {
                if (this.gameLogic && this.gameLogic.getGameState() === GameState.PLAYING) {
                    this.gameLogic.setGameState(GameState.OVER);
                    console.log("Game Over - VS Hidden");
                }
            }
        });
    }

    registerCodeSubmitListener() {
        const submitCodeButton = document.getElementById("submit_code")!;
        submitCodeButton.addEventListener("click", async () => {
            const codeInput = document.getElementById("auth_code") as HTMLInputElement;
            if (!await this.gameLogic.checkCode(codeInput.value)) {
                this.showAuthError("Invalid Code!");
                return;
            }

            this.gameLogic.processAuth();
        });
    }

    registerSigSubmitListener() {
        const submitSigButton = document.getElementById("submit_sig")!;
        submitSigButton.addEventListener("click", async () => {

            const canvas = document.getElementById("sig_canvas") as HTMLCanvasElement;
            const base64 = canvas.toDataURL("image/jpg");

            if (await this.gameLogic.checkSig(base64)) {
                // temporary
                this.hideSigModal();
                console.log("Player has signed");
                this.authDone();
                this.registerGameStartClickListener();

            }
            else {
                this.showSigError("Invalid Signature!");
            }

            //this.gameLogic.processAuth();
        });
    }

    // secure this
    authDone() {
        this.blur.id = "done_blur";
        this.tapToPlayLabel.style.opacity = "1";

        // wait so clicking menu won't start game once auth done
        setTimeout(() => {
            document.addEventListener("click", () => {

                let boat = this.engine.findEntityByTag("player")! as Boat;
                if (boat) {
                    boat.enableControls();
                }

                if (this.gameLogic.getGameState() === GameState.IDLE || this.gameLogic.getGameState() === GameState.OVER) {
                    this.gameLogic.setGameState(GameState.PLAYING);

                    this.scoreVal.style.opacity = "1";
                    this.gameStartThings.style.opacity = "0";
                    this.vignette.style.opacity = "0";
                }
            });

        }, 500);


    }

    registerGameStartClickListener() {
        if (this.isTapToPlayRegistered)
            return;

        this.isTapToPlayRegistered = true;

        document.addEventListener("click", () => {

            let boat = this.engine.findEntityByTag("player")! as Boat;
            if (boat) {
                boat.enableControls();
            }

            if (this.gameLogic.getGameState() === GameState.IDLE || this.gameLogic.getGameState() === GameState.OVER) {
                this.gameLogic.setGameState(GameState.PLAYING);

                this.gameLogic.processAuth();
                console.log("Re-Validating Player Authentication");

                this.scoreVal.style.opacity = "1";
                this.gameStartThings.style.opacity = "0";
                this.vignette.style.opacity = "0";
            }
        });
    }

    unregisterGameStartClickListener() {

        if (!this.isTapToPlayRegistered)
            return;

        this.isTapToPlayRegistered = false;
        document.removeEventListener("click", () => { });
    }

    showAuthModal() {
        this.authModal.style.display = "flex";
    }

    hideAuthModal() {
        this.authModal.style.display = "none";
    }

    showSigModal() {
        this.sigModal.style.display = "flex";
        let text = document.getElementById("sig_text")!;
        text.textContent = "Hey " + this.gameLogic.getPlayerData().username + ", it seems like we still don't have your signature..";
    }

    hideSigModal() {
        this.sigModal.style.display = "none";
    }

    showAuthError(error: string) {
        this.authError.style.display = "flex";
        this.authError.getElementsByTagName("h1")[0].textContent = error;
    }

    showSigError(error: string) {
        this.sigError.style.display = "flex";
        this.sigError.getElementsByTagName("h1")[0].textContent = error;
    }


    showGameOver() {
        this.gameStartThings.style.opacity = "1";
        this.vignette.style.opacity = "1";
        this.scoreVal.style.opacity = "0";

        this.lastScoreLabel.style.display = "block";
        this.lastScoreLabel.innerHTML = "Your Score: " + Math.round(this.gameLogic.getCurrentScore());

        if (Math.round(this.gameLogic.getCurrentScore()) > this.gameLogic.getPlayerData().top_score) {
            this.newRecordLabel.style.display = "block";
        }
    }

    showAlternateControlsModal() {
        this.alternateControlsModal.style.display = "flex";
    }

    hideAlternateControlsModal() {
        this.alternateControlsModal.style.display = "none";
    }

    showPermissionsModal() {
        this.permissionsModal.style.display = "flex";
    }

    hidePermissionsModal() {
        this.permissionsModal.style.display = "none";
    }
}