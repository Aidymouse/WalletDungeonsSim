// type Room = {
//           id: number;
//           dieFace: number;
//           tower: Room[];
//           type: 'room' | 'must be filled' | 'blocked'
// };
//
// type WalletDungeon = { [coords: number]: Room };

import { Room } from "./Room.js";
import { EdgeRoom } from "./EdgeRoom.js";
import { OneRoom } from "./OneRoom.js";
import { FiveRoom } from "./FiveRoom.js";
import { SixRoom } from "./SixRoom.js";
import { MustBeFilledRoom } from "./MustBeFilledRoom.js";

import { rand, popRandom, coordsToString, stringToCoords } from './helper.js'

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

  constructor(num_dice, dungeonObj) {
		if (dungeonObj) {
			this.dungeon = structuredClone(dungeonObj)
		} else {
    	this.dungeon = {};
    	this.generate(num_dice);
		}	

  }


  setRoom(room, x, y) {
    const coords = decodeToCoordsObj(x, y);
    if (!coords) {
      return;
    }
    room.setPosition(coords.x, coords.y);
    this.dungeon[coordsToString(coords)] = room;

    if (room.type !== "edge") {
      const emptyNeighboursOfAdded = Object.values(
        this.getNeighbours(coords.x, coords.y),
      ).filter((n) => n.room === undefined);

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

		console.log("Unknown how to get a room from", x, y);

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

getEmptyNeighbours = (x, y) => {
		return Object.values(this.getNeighbours(x, y)).filter( (n) => n.room === undefined || n.room.type === "edge");
}


	getFilledNeighbours(x, y) {
    return Object.values(this.getNeighbours(x, y)).filter(
      (n) => n.room !== undefined && n.room.type !== "edge",
    );
	}

  getEdges() {
    let edgeKeys = {};
    for (const key of Object.keys(this.dungeon)) {
      if ([BLOCKED.type].includes(this.room(key).type)) {
        continue;
      }
      const coords = stringToCoords(key);
      const neighbours = this.getNeighbours(coords.x, coords.y);

      if (neighbours.up === undefined) {
        edgeKeys[`${coords.x}:${coords.y + 1}`] = true;
      }
      if (neighbours.down === undefined) {
        edgeKeys[`${coords.x}:${coords.y - 1}`] = true;
      }
      if (neighbours.left === undefined) {
        edgeKeys[`${coords.x - 1}:${coords.y}`] = true;
      }
      if (neighbours.right === undefined) {
        edgeKeys[`${coords.x + 1}:${coords.y}`] = true;
      }
    }

    return Object.keys(edgeKeys).map((coordKey) => ({
      x: stringToCoords(coordKey).x,
      y: stringToCoords(coordKey).y,
      type: "edge",
    }));
  }

  getMustBeFilled() {
    return Object.values(this.dungeon).filter(
      (r) => r.type === MUSTBEFILLED.type,
    );
  }

  getValidPlacements() {
    return this.getEdges().concat(this.getMustBeFilled());
  }

  /** CHECKERS **/

  // Gets the fitness of a room placement if it has provided neighbours
  // Returns [eligible, fitnessScore, newLayout]
  getFitness(room, neighbours) {
    const prospectiveLocations = this.getValidPlacements().filter((r) =>
      this.fitsConstraints(room, r.x, r.y),
    );

    for (place of prospectiveLocations) {
    }

    console.log(prospectiveLocations);

    switch (room.roll) {
      case -1:
        return false;
      case 1: {
        if (
          Object.values(neighbours).filter((n) => n !== undefined).length > 1
        ) {
          return false;
        }
        if (
          Object.values(neighbours).filter((n) => n !== undefined).length === 1
        ) {
          return true;
        }
        return false;
      }
    }
  }

  /* Can this room go into the spot at coord X, Y ? */
  canGoHere(room, x, y) {
    if (this.room(x, y)) {
      if (this.room(x, y).type === BLOCKED.type) {
        return [false, CantGoHere.BLOCKED];
      } else if (this.room(x, y).type === MUSTBEFILLED.type) {
        return [false, CantGoHere.OCCUPIED];
      } else {
        return [false, CantGoHere.OCCUPIED];
      }
    }
    if (this.room(x, y)) {
      return [false, CantGoHere.OCCUPIED];
    }

    switch (room.roll) {
      case 1: {
        if (
          Object.values(this.getNeighbours(room.x, room.y)).filter(
            (r) => r !== undefined,
          ).length > 1
        ) {
          return [false, CantGoHere.FAILS_CONSTRAINTS];
        }
      }
    }

    return [true, CanGoHere.COULD];
  }

  /** GENERATOR **/

  generate(num_dice) {
    /** Roll dice **/
    let rolls = [];
    for (let i = 0; i < num_dice; i++) {
      rolls.push(rand(1, 6));
    }
    console.log("Rolls", rolls);

    /** Turn rolls into initial rooms **/
    let rooms = [];

    for (let i = 0; i < rolls.length; i++) {
      const roll = rolls[i];

      switch (roll) {
        case 1:
          rooms.push(new OneRoom());
          break;
        case 5:
          if (rooms.find((r) => r.getValue() === 5)) {
            rooms.find((r) => r.getValue() === 5).addToTower();
          } else {
            rooms.push(new FiveRoom());
          }
          break;
        case 6:
          rooms.push(new SixRoom());
          break;
      }
    }

    rooms.sort((r1, r2) => r1.getValue() - r2.getValue());

    console.log("Rooms", rooms);

    /** Put the rooms togethers **/

    // Hall
    for (let hallY = 0; rooms.at(-1)?.getValue() === 6; hallY++) {
      this.setRoom(rooms.pop(), 0, hallY);
    }

    // Tower
    if (rooms.at(-1)?.getValue() === 5) {
      let fiveRoom = rooms.pop();
      this.setRoom(fiveRoom, 1, 0);
      for (const empty of this.getEmptyNeighbours(1, 0)) {
        this.setRoom(new MustBeFilledRoom(), empty.x, empty.y);
      }
    }

    while (rooms.length > 0) {
      const room = rooms.pop();

      console.log("Trying to place", room);
      const places = filterChildren(
        this.dungeon,
        (r) => r.type === "mustBeFilled",
      );
			const placeKeys = Object.keys(places)


      let placed = false;
      while (placeKeys.length > 0 && placed === false) {
        const placeKey = popRandom(placeKeys);
        const replacedRoom = this.room(placeKey);
				// That edits are applied to
				const dungeonCopy = new WalletDungeon(undefined, this.dungeon)

        if (!room.checkConstraints(this, replacedRoom.x, replacedRoom.y)) {
          continue;
        } 

				let affectStack = []

				const affectedRooms = replacedRoom.getAffectedRooms().map(affectKey => this.room(affectKey)).filter(r => r !== undefined && r.type !== 'edge')
				console.log("Affected rooms", affectedRooms)

				affectStack = affectStack.concat(affectedRooms)

				// I think i can get this working with a basically recursive iteration on affected blocks to see if they're all good with the new map
				while (affectStack > 0) {
					const affected = affectStack.pop()
				}
				
				

      }

      if (placed === false) {
        console.log(`Couldn't find anywhere to place`, room);
        //throw new Error(`Couldn't find anywhere to place ${room}`)
      }
    }

    console.log("Dungeon", this.dungeon);
  }

  draw() {
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

    for (let row = maxY; row >= minY; row--) {
      let rowString = "";
      for (let col = minX; col <= maxX; col++) {
        const coords = coordsToString({ x: col, y: row });

        if (this.room(coords)) {
          rowString += `${this.room(coords).getDrawChar()}`;
        } else {
          rowString += `-`;
        }
      }
      console.log(rowString);
    }
  }
}
