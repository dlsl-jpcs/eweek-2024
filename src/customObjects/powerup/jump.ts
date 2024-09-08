import { Box3, CircleGeometry, Mesh, MeshBasicMaterial, Object3D, SphereGeometry } from "three";
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

    public start(): void {
        super.start();
        this.player = this.findEntityByTag("player") as Boat
    }

    override onTrigger(): void {
        super.onTrigger();

        if (!this.player) {
            return;
        }

        this.player.setCanJump(true);

        setTimeout(() => {
            this.player.setCanJump(false);
        }, 5000);
    }


}