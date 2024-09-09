import { Color } from "three";
import { Entity } from "../engine/engine";
import { hemisphereLight, shadowLight } from "../customObjects/lights";

export class DayNightCycle extends Entity {

    private timer: number = 0;
    private duration: number = 100;

    private world!: HTMLElement;

    constructor() {
        super("DayNightCycle");

        this.world = document.getElementById("world")!;
    }

    update(deltaTime: number): void {
        this.updateDayNightCycle();

        this.timer += deltaTime;

        if (this.timer > this.duration) {
            this.timer = 0;
        }
    }

    private updateDayNightCycle(): void {
        let time = this.timer / this.duration;
        let light = 1;



        const sunrise = new Color("#FDA26B")
        const sunset = new Color("#FF4D4D")
        const dusk = new Color("#1A1A2E")
        const dawn = new Color("#1A1A2E")


        this.world.style.background = "";

        // interpolate the color of the sky,
        // between the start and end (should end with start again) colors
        if (time < 0.25) {
            light = 1;
            const color = interpolateColor(dawn, sunrise, time * 4);
            this.world.style.background = color.getStyle();
            shadowLight.color = color;

        } else if (time < 0.5) {
            light = 0.5;
            const color = interpolateColor(sunrise, sunset, time * 4 - 1);
            this.world.style.background = color.getStyle();
            shadowLight.color = color
        } else if (time < 0.75) {
            light = 0.5;
            const color = interpolateColor(sunset, dusk, time * 4 - 2)
            this.world.style.background = color.getStyle();
            shadowLight.color = color
        } else {
            light = 1;
            const color = interpolateColor(dusk, dawn, time * 4 - 3);
            this.world.style.background = color.getStyle();
            shadowLight.color = color
        }
    }
}

function interpolateColor(startColor: Color, endColor: Color, factor: number): Color {
    if (factor > 1) factor = 1;
    if (factor < 0) factor = 0;
    const r = startColor.r + (endColor.r - startColor.r) * factor;
    const g = startColor.g + (endColor.g - startColor.g) * factor;
    const b = startColor.b + (endColor.b - startColor.b) * factor;
    return new Color(r, g, b);
}