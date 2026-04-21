
import { Room } from './Room.js'

export class SixRoom extends Room {
	type = "room";

	constructor() {
		super()
	}

	// TODO: prospectively allowed locations include those one away from an empty space
	getValue() {
		return 6;
	}

	getDrawChar() { return '6' }

	drawOnCanvas(c) {
		c.save()
		c.fillStyle = "lightgreen"
		c.fillRect(this.x, this.y, 1, 1)
		c.fillStyle = "darkgreen"
		c.fillText('6', this.x+0.5, this.y+0.5)
		c.restore()
	}

}
