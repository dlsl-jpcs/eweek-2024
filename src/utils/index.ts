import { Camera, Plane, Raycaster, Vector2, Vector3 } from "three";

export class Position {
  	constructor(public x: number, public y: number) {}
}

export class Size {
  	constructor(public width: number, public height: number) {}
}

export function cartesianToIsometric(pos: Position) {
    var tempPt = new Position(0, 0);
    tempPt.x = pos.x - pos.y;
    tempPt.y = (pos.x + pos.y) / 2;
  	return tempPt;
}

export function randomIntRange(min: number, max: number) { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function clamp(input: number, min: number, max: number) {
  return Math.min(Math.max(input, min), max);
};
