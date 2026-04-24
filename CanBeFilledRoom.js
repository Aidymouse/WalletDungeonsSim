import { RoomType } from './types.js'
import { Room } from './Room.js'

export class CanBeFilledRoom extends Room {
	type = RoomType.CANBEFILLED;

	getDrawChar() {
		return "^"
	}
	
	clone() {
		const c = new CanBeFilledRoom();
		c.x = this.x;
		c.y = this.y;
		return c;
	}
}
