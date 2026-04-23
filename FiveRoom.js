import { Room } from './Room.js'

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

}
