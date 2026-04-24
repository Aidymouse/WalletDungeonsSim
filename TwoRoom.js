import { RoomType } from './types.js'
import { Room } from './Room.js'

export class TwoRoom extends Room {

	type = RoomType.ROOM

	clone() {
		const c = new TwoRoom();
		c.x = this.x; c.y = this.y;
		return c;
	}

	getDrawChar() { return '2' }

	checkConstraints(dungeon) {
		if (dungeon.neighboursOfType(this.x, this.y, [RoomType.ROOM]).length > 2) {
			return false
		}

		return true
	}

	propagateChanges(dungeon, prop_results=[]) {
		if (!this.checkConstraints(dungeon)) {
			return prop_results.concat([{room: this, valid: false}}]
		}

		if (dungeon.neighboursOfType(this.x, this.y, [RoomType.ROOM]).length === 2) {
			for (const neighbour of dungeon.neighboursOfType(this.x, this.y, [RoomType.MUSTBEFILLED])) {

			// I forsee trouble with wantanly changing rooms without checking in with them first.
		}
		} else {
		}
		
	}

}
