import { Boat } from "../customObjects/boat";
import { Powerup } from "../customObjects/powerup/powerup";
import { Entity } from "../engine/engine";

type StatusEffect = {
    powerup: Powerup;
    htmlElement: HTMLElement;
}

export class StatusEffectUi extends Entity {

    private player!: Boat;

    private statusEffect!: HTMLElement;

    private currentStatusEffects: StatusEffect[] = [];

    constructor() {
        super("StatusEffectUi");
    }

    public start(): void {
        this.player = this.engine.findEntityByTag("player") as Boat;

        this.statusEffect = document.getElementById("status-effect") as HTMLElement;
        this.statusEffect.innerHTML = "";   
    }

    update(_deltaTime: number): void {
        const powerups = this.player.getActivePowerups();

        for (const powerup of powerups) {
            if (!this.currentStatusEffects.find((statusEffect) => statusEffect.powerup === powerup)) {
                this.addStatusEffect(powerup);
            }
        }

        // remove status effects that are no longer active
        this.currentStatusEffects = this.currentStatusEffects.filter((statusEffect) => {
            if (!powerups.includes(statusEffect.powerup)) {
                statusEffect.htmlElement.remove();
                return false;
            }
            return true;
        });
    }

    addStatusEffect(powerup: Powerup): void {
        const statusEffect = document.createElement("div");


        statusEffect.classList.add("status-effect-item");
        this.statusEffect.appendChild(statusEffect);
        this.currentStatusEffects.push({ powerup, htmlElement: statusEffect });

        const displayString = this.getDisplayString(powerup);
        const paragraph = document.createElement("p");
        paragraph.classList.add("status-effect-text");
        paragraph.innerHTML = displayString;
        statusEffect.appendChild(paragraph);

        const loadingElement = document.createElement("div");
        loadingElement.classList.add("loading-element");

        this.statusEffect.appendChild(loadingElement);

        statusEffect.appendChild(loadingElement);
        const interval = setInterval(() => {
            const offset = powerup.timer / powerup.getDuration();  

            loadingElement.style.width = `${offset * 100}%`;

            if (offset >= 1) {
                clearInterval(interval);
            }
        }, 20);
    }

    getDisplayString(powerup: Powerup): string {
        console.log(powerup);
        if (powerup.tag === "Speedup") {
            return "  Speed +100";
        } 

        if (powerup.tag === "Jump") {
            return "  Tap to jump";
        }

        if (powerup.tag === "Ghost") {
            return "Ghost mode";
        }

        if (powerup.tag === "Jetpack") {
            return "Jetpack";
        }
        return "  Powerup";
    }
}