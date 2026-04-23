import { Room } from './Room.js'
import { RoomType } from './types.js'

export class BlockedRoom extends Room {
	type = RoomType.BLOCKED

	constructor() {
		super()
	}
}
