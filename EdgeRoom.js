import { Room } from './Room.js'

export class EdgeRoom extends Room {
	type = "edge";

	constructor() {
		super()
	}

	getValue() { return -1; }
	getDrawChar() { return '+' }

	drawOnCanvas(c) {
		c.save()
		c.fillStyle = "darkblue"
		c.fillRect(this.x, this.y, 1, 1)
		c.fillStyle = "lightgray"
		c.fillText('+', this.x+0.5, this.y+0.5)
		c.restore()
	}

	clone() {
		const clone = new EdgeRoom()
		clone.x = this.x;
		clone.y = this.y;
		return clone
	}

	okayWithNeighbours(neighbours) { return true }

}
