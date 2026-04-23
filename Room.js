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

	propagateChanges(dungeon, prop_results=[]) {
		// Check self
		// If we're now in an invalid state, return an indication
		// Otherwise update ourself, possibly changeing neighoburs, then propagate changes out to all neighbours that it matters to

		return {room: this, valid: true}
 	}

	clone() {
	}
}
