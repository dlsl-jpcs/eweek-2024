import { Box3, Mesh, MeshBasicMaterial, Object3D, SphereGeometry } from "three";
import { Powerup } from "./powerup";
import { Boat } from "../boat";

export class Ghost extends Powerup {

    private player!: Boat;

    constructor() {
        super("Ghost");
    }

    getRenderObject(): Object3D {
        const geom = new SphereGeometry(10, 10, 10);
        const mat = new MeshBasicMaterial({ color: 0xffff00 });
        return new Mesh(geom, mat);
    }

    getCollisionBox(): Box3 {
        return new Box3().setFromObject(this.renderObject);
    }

    public getDuration(): number {
        return 3;
    }

    public start(): void {
        super.start();

        this.player = this.findEntityByTag("player") as Boat;
    }

    update(deltaTime: number): void {
        super.update(deltaTime);

        if (!this.triggered) {
            return;
        }

        this.timer += deltaTime;

        if (this.timer >= this.getDuration()) {
            this.player.setGhost(false);
            this.destroy();
        } else {
            this.player.setGhost(true);
        }
    }
}