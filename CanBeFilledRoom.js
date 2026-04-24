import { RoomType } from './types.js'
import { Room } from './Room.js'

export class CanBeFilledRoom extends Room {
	type = RoomType.CANBEFILLED;

	constructor(X, Y) {
		super(X, Y)
	}

	getDrawChar() {
		return "^"
	}
	
	clone() {
		const c = new CanBeFilledRoom();
		c.x = this.x;
		c.y = this.y;
		return c;
	}

	okayWithNeighbours(neighbours) { return true }
}
