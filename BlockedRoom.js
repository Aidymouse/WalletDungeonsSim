import { Room } from './Room.js'
import { RoomType } from './types.js'

export class BlockedRoom extends Room {
	type = RoomType.BLOCKED

	constructor() {
		super()
	}

	getDrawChar() { return 'X' }

	clone() {
		const clone = new BlockedRoom()
		clone.x = this.x; clone.y = this.y;
		return clone;
	}
}
