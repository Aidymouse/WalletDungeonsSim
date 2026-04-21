import { Room } from './Room.js'

export class OneRoom extends Room {
	type = "room";

	constructor() {
		super()
	}

	// TODO: prospectively allowed locations include those one away from an empty space
	checkConstraints(dungeon, x, y) {
		const filledNeighbours = dungeon.getFilledNeighbours(x, y)

		if (filledNeighbours.length !== 1) { return false }
		return true;
	}

	getValue() { return 1; }
	getDrawChar() { return '1' }

	drawOnCanvas(c) {
		c.save()
		c.fill = "blue"
		c.fillRect(this.x, this.y, 1, 1)
		c.restore()
	}


}
