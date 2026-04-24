import { RoomType } from './types.js'
import { Room } from './Room.js'
import { BlockedRoom } from './BlockedRoom.js'
import { MustBeFilledRoom } from './MustBeFilledRoom.js'

export class OneRoom extends Room {
	type = "room";

	constructor(X, Y) {
		super(X, Y)
	}

	clone() {
		const newRoom = new OneRoom();
		newRoom.x = this.x;
		newRoom.y = this.y;
		return newRoom;
	}

	getValue() { return 1; }
	getDrawChar() { return '1' }

	drawOnCanvas(c) {
		c.save()
		c.fill = "blue"
		c.fillRect(this.x, this.y, 1, 1)
		c.restore()
	}


	// TODO: prospectively allowed locations include those one away from an empty space
	checkConstraints(dungeon, x, y) {
		const filledNeighbours = dungeon.neighboursOfType(x, y, [RoomType.ROOM])
		if (filledNeighbours.length !== 1) { return false }
		return true;
	}


	
	okayWithNeighbours(newNeighbours) {

		if (Object.values(newNeighbours).filter(n => n.room?.type === RoomType.ROOM).length > 1) { return false }

		// If there aren't enough MUSTBEFILLED neighbours then don't allow
		if (
			Object.values(newNeighbours).filter(n => n.room?.type === RoomType.MUSTBEFILLED).length < 1 
			&& Object.values(newNeighbours).filter(n => n.room?.type === RoomType.ROOM).length === 0) { return false }

		return true
	}


	// Assuming x, y, is a valid position, what rooms next to me will need to change?
	// @returns (room with X and Y updated)[]
	getChangedAdjacents(neighbours, x, y) {
		const neighbourRooms = Object.values(neighbours)

		let changedAdjacents = {}

		// If there's at least one adjacent real room to me, turn everything else into blocked
		if (neighbourRooms.filter(n => n.room?.type === RoomType.ROOM).length > 0) {

			for (const [nKey, n] of Object.entries(neighbours)) {
				if (![RoomType.ROOM].includes(n.room?.type)) {
					changedAdjacents[nKey] = { x: n.x, y: n.y, room: new BlockedRoom(n.x, n.y) }
				}
				
			}
			
		} else {
		// Otherwise, I was probably spawned on an edge or next to a MUSTBEFILLED, so turn everything near me into a MUSTBEFILLED
			for (const [nKey, n] of Object.entries(neighbours)) {
				if (![RoomType.ROOM].includes(n.room?.type)) {
					changedAdjacents[nKey] = { x: n.x, y: n.y, room: new MustBeFilledRoom(n.x, n.y) }
				}
				
			}
		}

		return changedAdjacents
			
	}

}
