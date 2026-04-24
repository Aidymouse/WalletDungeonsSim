// type Room = {
//           id: number;
//           dieFace: number;
//           tower: Room[];
//           type: 'room' | 'must be filled' | 'blocked'
// };
//
// type WalletDungeon = { [coords: number]: Room };

import { RoomType } from './types.js'
import { Room } from "./Room.js";
import { EdgeRoom } from "./EdgeRoom.js";
import { OneRoom } from "./OneRoom.js";
import { TwoRoom } from "./TwoRoom.js";
import { FiveRoom } from "./FiveRoom.js";
import { SixRoom } from "./SixRoom.js";
import { MustBeFilledRoom } from "./MustBeFilledRoom.js";

import { rand,  haveNeighboursChanged, negateDir, popRandom, coordsToString, stringToCoords } from './helper.js'

const filterChildren = (ob, filt) =>
  Object.fromEntries(Object.entries(ob).filter(([k, v]) => filt(v)));

const decodeToCoordsObj = (x, y) => {
  if (typeof x === "number" && typeof y === "number") {
    return { x, y };
  } else if (typeof x === "string") {
    return stringToCoords(x);
  } else if (typeof x === "object" && x.x !== undefined && x.y !== undefined) {
    return x;
  }

  return undefined;
};

export class WalletDungeon {
  dungeon;

	history = [];

  constructor(num_dice, dungeonObj) {
    this.dungeon = {};
		if (dungeonObj) {
			this.cloneDungeon(dungeonObj)
		} else {
    	this.generate(num_dice);
		}	

  }

	cloneDungeon(dungeonObj) {
		for (const [coords, room] of Object.entries(dungeonObj)) {
			if (room) {
				this.dungeon[coords] = room.clone()
			}
		}
	}


  setRoom(room, x, y) {
    const coords = decodeToCoordsObj(x, y);
    if (!coords) {
      return;
    }
    room.setPosition(coords.x, coords.y);
    this.dungeon[coordsToString(coords)] = room;

    if (![RoomType.BLOCKED, RoomType.EDGE].includes(room.type)) {
			
      const emptyNeighboursOfAdded =  this.neighboursOfType(coords.x, coords.y, [undefined]);

      for (const emptyNeighbour of emptyNeighboursOfAdded) {
        this.setRoom(new EdgeRoom(), emptyNeighbour.x, emptyNeighbour.y);
      }
    }
  }

  /** GETTERS **/

room(x, y) {
		if (typeof x === "string") {
				return this.dungeon[x];
		} else if (typeof x === "number" && typeof y === "number") {
				return this.dungeon[coordsToString({ x, y })];
		} else if (
						typeof x === "object" &&
						x.x !== undefined &&
						x.y !== undefined
						) {
				return this.dungeon[coordsToString(x)];
		}

		throw Error(`Unknown how to get a room from ${x}, ${y}`)

		return undefined;
}

getNeighbours(x, y) {
		return {
				up: { x: x, y: y + 1, room: this.room(x, y + 1) },
				down: { x: x, y: y - 1, room: this.room(x, y - 1) },
				left: { x: x - 1, y: y, room: this.room(x - 1, y) },
				right: { x: x + 1, y: y, room: this.room(x + 1, y) },
		};
}

	neighboursOfType(x, y, ts) { return Object.values(this.getNeighbours(x, y)).filter(n => (n.room === undefined && ts.includes(undefined)) || ts.includes(n.room.type)) }

	neighboursNotOfType(x, y, ts) { return Object.values(this.getNeighbours(x, y)).filter(n => (n.room !== undefined && ts.includes(undefined)) && !ts.includes(n.room.type)) }


  getEdges() {
    return Object.values(this.dungeon).filter( (r) => r.type === RoomType.EDGE);
  }

  getMustBeFilled() {
    return Object.values(this.dungeon).filter( (r) => r.type === RoomType.MUSTBEFILLED);
  }

	getCanBeFilled() {
	}

	roomsOfType(t) { return Object.values(this.dungeon).filter(r => r.type === t) }
	roomsOfTypes(ts) { return Object.values(this.dungeon).filter(r => ts.includes(r.type)) }

	// TODO: at some point each placement should have weights. Or each room should be able to specify it's own weights!
  getValidPlacements() {
    return this.roomsOfTypes([RoomType.MUSTBEFILLED, RoomType.CANBEFILLED, RoomType.EDGE])
  }


	// ChangeRecord could be - when you last looked at this room, I had these neighbours and I was this type. Let's it be more live than looking at the actual dungeon
	isItOkayToPlace(room, x, y, withNeighbours, changeRecord = {}) {

		// TODO: not working quite right
		let record = changeRecord[`${x}:${y}`]
		if (!record) {
			changeRecord[`${x}:${y}`] = { room: this.room(x, y), neighbours: this.getNeighbours(x, y) }
			record = changeRecord[`${x}:${y}`]
		}

		if (!haveNeighboursChanged(record.neighbours, withNeighbours) && room.type === record.room.type) {
			return { valid: true, placements: [] }
		}

		changeRecord[`${x}:${y}`] = { room, neighbours: withNeighbours }

		console.log("Can I place", room, `at ${x}, ${y}?`)

		if (!room.okayWithNeighbours(withNeighbours)) { return {valid: false}; }

		let placements = []

		// Am I going to change any of the nearby neighbours?
		const changedNeighbours = room.getChangedAdjacents(withNeighbours, x, y)
		console.log(changedNeighbours)

		for (let [dir, n] of Object.entries(withNeighbours)) {
			if (n.room === undefined) { continue }
			if (changedNeighbours[dir]) { n = changedNeighbours[dir] }
			const neighboursN = this.getNeighbours(n.x, n.y)
			neighboursN[negateDir(dir)] = room
			const placeRes = this.isItOkayToPlace(n.room, n.x, n.y, neighboursN, changeRecord)
			if (!placeRes.valid) { 
				// TODO: special case, if we're replacing a MUST BE PLACED with a CAN BE PLACED, we can reject that one change without rejecting the entire placement
				//if this.room(changedNeigher.x, n.y)?.type === RoomType.MUSTBE
				return {valid: false} 
			}
			placements = placements.concat(placeRes.placements)
			
		}

		placements = placements.concat([{x, y, room}])


		return {valid: true, placements };

	}

  /** GENERATOR **/
  generate(num_dice) {
    /** Roll dice **/
    let rolls = [];
    for (let i = 0; i < num_dice; i++) {
      rolls.push(rand(1, 6));
    }

    /** Turn rolls into initial rooms **/
    let rooms = [];
		let sixRooms = [];
		let fiveRoom = null;

    for (let i = 0; i < rolls.length; i++) {
      const roll = rolls[i];

      switch (roll) {
        case 1:
          rooms.push(new OneRoom());
          break;
        case 2:
          rooms.push(new TwoRoom());
          break;
        case 5:
          if (fiveRoom !== null) {
						fiveRoom.addToTower();
          } else {
						fiveRoom = new FiveRoom();
          }
          break;
        case 6:
          sixRooms.push(new SixRoom());
          break;
      }
    }

    //rooms.sort((r1, r2) => r1.getValue() - r2.getValue());

    console.log("Rooms", rooms, sixRooms, fiveRoom);

    /** Put the rooms togethers **/

    // Hall
    for (const [hallY, room] of sixRooms.entries()) {
      this.setRoom(room, 0, parseInt(hallY));
    }
		this.history.push(this.draw())

    // Tower
    if (fiveRoom !== null) {

			let fivePlacement = popRandom(this.roomsOfType(RoomType.EDGE)) ?? {x: 0, y: 0}

      this.setRoom(fiveRoom, fivePlacement.x, fivePlacement.y);

      for (const empty of this.neighboursOfType(fiveRoom.x, fiveRoom.y, [undefined, RoomType.EDGE])) {
        this.setRoom(new MustBeFilledRoom(), empty.x, empty.y);
      }

			this.history.push(this.draw())
    }

		// Start adding rooms one by one
    while (rooms.length > 0) {
      const room = rooms.pop();

      console.log("Trying to place", room);

			const firstChoicePlacements = this.roomsOfType(RoomType.MUSTBEFILLED).map(r => `${r.x}:${r.y}`)
			let secondChoicePlacements = this.roomsOfType(RoomType.CANBEFILLED).map(r => `${r.x}:${r.y}`)
			let thirdChoicePlacements = this.roomsOfType(RoomType.EDGE).map(r => `${r.x}:${r.y}`)

			//const validPlacements = this.getValidPlacements().map(r => `${r.x}:${r.y}`)

			let placeKeys = firstChoicePlacements

      let placed = false;
      while (placeKeys.length > 0 && placed === false) {
        const placeKey = popRandom(placeKeys);

				if (placeKeys.length === 0) {
					if (secondChoicePlacements !== null) {
						console.log("Trying second choice")
						placeKeys = [...secondChoicePlacements]
						secondChoicePlacements = null
					} else if (thirdChoicePlacements !== null) {
						console.log("Trying third choice")
						placeKeys = [...thirdChoicePlacements]
						thirdChoicePlacements = null
					}
				}

        const replacedRoom = this.room(placeKey);
				console.log("Room to replace", replacedRoom)

				room.x = replacedRoom.x
				room.y = replacedRoom.y
				debugger
				const placeResult = this.isItOkayToPlace(
					room,
					replacedRoom.x,
					replacedRoom.y,
					this.getNeighbours(replacedRoom.x, replacedRoom.y)
				)

				console.log(placeResult)

				if (!placeResult.valid) { continue }

				for (const placement of placeResult.placements) {
					this.setRoom(placement.room, placement.x, placement.y)
				}


				placed = true;


			}

			this.history.push(this.draw())

      if (placed === false) {
        console.log(`Couldn't find anywhere to place`, room);
        //throw new Error(`Couldn't find anywhere to place ${room}`)
      }
    }

    console.log("Dungeon", this.dungeon);
  }

	/* @returns string - Dungeon string */
  draw(drawCoords = true) {
		if (Object.keys(this.dungeon).length === 0) { return "" }
    const minX = Object.keys(this.dungeon).reduce(
      (min, key) => Math.min(stringToCoords(key).x, min),
      0,
    );
    const maxX = Object.keys(this.dungeon).reduce(
      (min, key) => Math.max(stringToCoords(key).x, min),
      -Infinity,
    );
    const minY = Object.keys(this.dungeon).reduce(
      (min, key) => Math.min(stringToCoords(key).y, min),
      0,
    );
    const maxY = Object.keys(this.dungeon).reduce(
      (min, key) => Math.max(stringToCoords(key).y, min),
      -Infinity,
    );

		let rowStrings = [];
    for (let row = maxY; row >= minY; row--) {
      let rowString = "";
      for (let col = minX; col <= maxX; col++) {
        const coords = coordsToString({ x: col, y: row });

        if (this.room(coords)) {
          rowString += `${this.room(coords).getDrawChar()}`;
        } else {
          rowString += `.`;
        }
      }
			rowStrings.push(rowString)
    }

		if (drawCoords) {
			for (let i=0; i < rowStrings.length; i++) {
				let yAxisValue = rowStrings.length-i+(minY-1)
				if (yAxisValue < -1) { yAxisValue = -yAxisValue }
				if (yAxisValue === -1) yAxisValue = '-'
				rowStrings[i] = `${yAxisValue}${rowStrings[i]}`
			}
			let xAxis = "\\"
			for (let i=1; i<rowStrings[0].length; i++) {
				let xAxisValue = i+(minX-1)
				if (xAxisValue < -1) { xAxisValue = -xAxisValue }
				if (xAxisValue === -1) xAxisValue = '-'
				xAxis += `${xAxisValue}`
			}
			rowStrings.push(`${xAxis}`)
		}

		const dungeonString = rowStrings.join("\n");
		console.log(dungeonString);
		return dungeonString;
  }
}
