
export const rand = (low, high) => Math.floor(Math.random() * high + (low - 1)) + low;
export const popRandom = (arr) =>
  arr.length > 0 ? arr.splice(rand(0, arr.length - 1), 1)[0] : undefined;

export const coordsToString = (coordsObj) => `${coordsObj.x}:${coordsObj.y}`;
export const stringToCoords = (s) => ({
  x: parseInt(s.split(":")[0]),
  y: parseInt(s.split(":")[1]),
});

export const negateDir = (dir) => {
	if (dir === 'up') { return 'down' }
	if (dir === 'down') { return 'up' }
	if (dir === 'left') { return 'right' }
	if (dir === 'right') { return 'left' }
}
