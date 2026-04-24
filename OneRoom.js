import { RoomType } from './types.js'
import { Room } from './Room.js'
import { BlockedRoom } from './BlockedRoom.js'

export class OneRoom extends Room {
	type = "room";

	constructor() {
		super()
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


	propagateChanges(dungeon, prop_results = []) {
			if (!this.checkConstraints(dungeon, this.x, this.y)) {
				prop_results.push({room: this, valid: false})
				return prop_results;
			}

			const neighbours = Object.values(dungeon.getNeighbours(this.x, this.y))

			// TODO: check if neighbours have changed since last propagation, and return straight away if so

			// Check if anyone next to use must be filled and is now blocked
			for (const neighbour of neighbours) {
				if (neighbour.room.type === 'mustBeFilled' || neighbour.room.type === 'edge' || neighbour.room === undefined) {
					dungeon.setRoom(new BlockedRoom(), neighbour.x, neighbour.y)
				}
			}


			// Turn any empty neighbours into blocked
			// TODO:

			// Propagate changes to filled neighbours
			const newNeighbours = dungeon.neighboursNotOfType(this.x, this.y, [undefined])
			for (const neighbour of newNeighbours) {
				console.log('Neighbour', neighbour)
				prop_results = prop_results.concat(neighbour.room.propagateChanges(dungeon, prop_results))
			}

			prop_results.push({room: this, valid: true})
			return prop_results
	}


}
