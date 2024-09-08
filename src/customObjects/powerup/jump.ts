import { Box3, Mesh, MeshBasicMaterial, Object3D, SphereGeometry } from "three";
import { Powerup } from "./powerup";
import { Boat } from "../boat";

/**
 * A powerup that allows the player to jump
 */
export class Jump extends Powerup {

    private player!: Boat;


    constructor() {
        super("Jump");
    }


    getRenderObject(): Object3D {
        // red sphere
        const geom = new SphereGeometry(10, 10, 10);
        return new Mesh(geom, new MeshBasicMaterial({ color: 0xff0000 }));
    }

    getCollisionBox(): Box3 {
        return new Box3().setFromObject(this.renderObject);
    }

    public getDuration(): number {
        return 5;
    }

    public start(): void {
        super.start();
        this.player = this.findEntityByTag("player") as Boat
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        if (!this.triggered) {
            return;
        }

        this.timer += deltaTime;
        this.player.setCanJump(true);

        if (this.timer >= this.getDuration()) {
            this.destroy();
        }
    }

    override onTrigger(): void {
        super.onTrigger();
    }
}