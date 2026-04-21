export class Room {
	x=undefined
	y=undefined

	type = "NOT_IMPLEMENTED";
	constructor() {}
	checkConstraints() {}
	getValue() {}
	setPosition(X, Y) { this.x = X; this.y = Y; }
	getDrawChar() { return 'R' }

	drawOnCanvas(ctx) { ctx.fillRect(this.x, this.y, 1, 1) }

	getAffectedRooms() { return [] }
}
