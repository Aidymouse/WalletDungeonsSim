import { Room } from './Room.js'

export class MustBeFilledRoom extends Room {
	type = 'mustBeFilled'
	constructor() { super() }
	getDrawChar() { return 'O'}

	clone() {
		const newRoom = new MustBeFilledRoom();
		newRoom.x = this.x;
		newRoom.y = this.y;
		return newRoom;
	}

	drawOnCanvas(c) {
		c.save()
		c.fillStyle = "turquoise"
		c.fillRect(this.x, this.y, 1, 1)
		c.fillStyle = "black"
		c.fillText('O', this.x+0.5, this.y+0.5)
		c.restore()
	}

	getAffectedRooms() {
		return [
			`${this.x}:${this.y-1}`,
			`${this.x}:${this.y+1}`,
			`${this.x+1}:${this.y}`,
			`${this.x-1}:${this.y}`,
		]
	}
}
