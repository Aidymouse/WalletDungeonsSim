import { RoomType } from './types.js'
import { Room } from './Room.js'
import { BlockedRoom } from './BlockedRoom.js'

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

		let changedAdjacents = {}
		for (const neighbourKey of ['up', 'down', 'left', 'right']) {
			const neighbour = neighbours[neighbourKey]
			if ([undefined, RoomType.EDGE, RoomType.MUSTBEFILLED, RoomType.CANBEFILLED].includes(neighbour.room?.type)) {
				changedAdjacents[neighbourKey] = {...neighbour, room: new BlockedRoom(neighbour.x, neighbour.y)}
			}
			
		}

		return changedAdjacents
			
	}

}
