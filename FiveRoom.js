import { RoomType } from './types.js'
import { Room } from './Room.js'
import { CanBeFilledRoom } from './CanBeFilledRoom.js'

export class FiveRoom extends Room {
	type = "room";
	height = 0;

	constructor() {
		super()
	}

	clone() {
		const newRoom = new FiveRoom();
		newRoom.x = this.x;
		newRoom.y = this.y;
		newRoom.height = this.height
		return newRoom;
	}

	// TODO: prospectively allowed locations include those one away from an empty space
	getValue() { return 5; }
	getDrawChar() { return '5'; }

	addToTower(v = 1) { this.height += v; }

	drawOnCanvas(c) {
		c.save()
		c.fillStyle = "orange"
		c.fillRect(this.x, this.y, 1, 1)
		c.fillStyle = "brown"
		c.fillText('5', this.x+0.5, this.y+0.5)
		c.restore()
	}


	propagateChanges(dungeon) {
		// Am I in an invalid state?
		// Five MUST be connected to two, but can be connected to up to four
		// So it basically isn't possible.

		// Update neighbours
		// A rather big decision to make is do we make all changes first, then propagate? 

		if (dungeon.neighboursOfType(this.x, this.y, [RoomType.ROOM]).length >= 2) {
			const mustBeFilledNeighbours = dungeon.neighboursOfType(this.x, this.y, [RoomType.MUSTBEFILLED])
			for (const n of mustBeFilledNeighbours) {
				dungeon.setRoom(new CanBeFilledRoom(), n.x, n.y);
				prop_results = prop_results.concat(dungeon.room(n.x, n.y).propagateChanges(dungeon, prop_results));
			}
		}

		return {room: this, valid: true}
	}

}
