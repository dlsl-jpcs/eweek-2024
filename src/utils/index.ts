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