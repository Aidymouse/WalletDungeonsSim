import { RoomType } from './types.js'
import { Room } from './Room.js'
import { BlockedRoom } from './BlockedRoom.js'
import { CanBeFilledRoom } from './CanBeFilledRoom.js'

export class TwoRoom extends Room {

	type = RoomType.ROOM

	getValue() { return 2 }

	clone() {
		const c = new TwoRoom();
		c.x = this.x; c.y = this.y;
		return c;
	}

	getDrawChar() { return '2' }

	okayWithNeighbours(newNeighbours) {
		const roomNeighbours = Object.values(newNeighbours).filter(n => n.room?.type === RoomType.ROOM)
		const potentialSpaces = Object.values(newNeighbours).filter(n => [RoomType.MUSTBEFILLED, RoomType.CANBEFILLED, undefined, RoomType.EDGE].includes(n.room?.type))

		if (roomNeighbours.length > 2) { return false }

		if (roomNeighbours.length + potentialSpaces.length < 2) { return false }

		return true
	}

	getChangedAdjacents(neighbours, x, y) {
		const roomNeighbours = Object.values(neighbours).filter(n => n.room?.type === RoomType.ROOM)

		let changed = {}

		if (roomNeighbours.length == 2) {
			for (const [nKey, n] of Object.entries(neighbours)) {
				if ([undefined, RoomType.EDGE, RoomType.MUSTBEFILLED, RoomType.CANBEFILLED].includes(n.room?.type)) {
					changed[nKey] = {x: n.x, y: n.y, room: new BlockedRoom(n.x, n.y)}
				}
			}
		} else {
			for (const [nKey, n] of Object.entries(neighbours)) {
				if ([undefined, RoomType.EDGE, RoomType.MUSTBEFILLED, RoomType.CANBEFILLED].includes(n.room?.type)) {
					changed[nKey] = {x: n.x, y: n.y, room: new CanBeFilledRoom(n.x, n.y)}
				}
			}
		}

		return changed
	}

}
