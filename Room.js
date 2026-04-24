export class Room {
	x=undefined
	y=undefined

	type = "NOT_IMPLEMENTED";
	constructor(X, Y) { this.x = X; this.y = Y;}
	checkConstraints() {}
	getValue() {}
	setPosition(X, Y) { this.x = X; this.y = Y; }
	getDrawChar() { return 'R' }

	drawOnCanvas(ctx) { ctx.fillRect(this.x, this.y, 1, 1) }

	clone() { 
		throw Error("Clone Not Implemented")
	}

	getChangedAdjacents(neighbours, x, y) { return {} }

	// @param neighbours - {up, down, left, right}
	okayWithNeighbours(newNeighbours) {
		throw Error("Okay with neighbours not implemented")
	}

}
