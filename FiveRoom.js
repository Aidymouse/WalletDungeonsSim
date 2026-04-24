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


	okayWithNeighbours(neighbours) {

		const neighbourRooms = Object.values(neighbours).map(n => n.room).filter(r => r !== undefined)

		if (neighbourRooms.filter(r => [RoomType.ROOM, RoomType.MUSTBEFILLED].includes(r.type)).length < 2) { return false }
		
		return true

		// If we don't have at least two potential neighbours (either filled of must be filled) then we're not chill	

		return true
	}

	getChangedAdjacents(neighbours) {
		const ns = Object.values(neighbours)

		let changed = {}
		if (ns.filter(n => n.room?.type === RoomType.ROOM).length >= 2) {
			for (const [nKey, n] of Object.entries(neighbours)) {
				if (n.room?.type === RoomType.MUSTBEFILLED) { changed[nKey] = { x: n.x, y: n.y, room: new CanBeFilledRoom(n.x, n.y)} }
			}
		}
		
		return changed
	}

}
