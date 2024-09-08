import { Box3, Object3D } from "three";
import { Entity } from "../../engine/engine";
import { Sea } from "../sea";

export abstract class Powerup extends Entity {

    private sea!: Sea;

    renderObject: Object3D;

    triggered: boolean = false;
    timer: number = 0;



    constructor(tag: string) {
        super(tag);

        this.object = new Object3D();
        this.object.position.y = -580;

        this.renderObject = this.getRenderObject();
        this.object.add(this.renderObject);

        const distance = 620;
        const angle = toRadians(200);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        this.renderObject.position.x = x;
        this.renderObject.position.y = y;
    }

    public start(): void {
        this.sea = this.findEntityByTag("sea") as Sea;
    }

    public abstract getDuration(): number;

    public onTrigger(): void {
        this.object.remove(this.renderObject);

        this.triggered = true;
    }

    override update(deltaTime: number): void {
        this.object.rotation.z -= this.sea.getSpeed() * deltaTime


        if (this.object.rotation.z < -2.2 && !this.triggered) {
            this.destroy();
        }
    }

    abstract getRenderObject(): Object3D;

    abstract getCollisionBox(): Box3;

    /**
     * Called when the user picks up the powerup but
     * it already has the powerup
     * 
     * This is useful for powerups that have a duration
     */
    onReTrigger() {
        this.timer -= this.getDuration();
    }

}

function toRadians(angle: number) {
    return angle * Math.PI / 180;
}