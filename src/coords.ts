import { hereApiKey } from './secret';

export type Coord = [number, number];

export function pointInPoly(polygon: Coord[], [y, x]: Coord) {
  const [vertx, verty] = polygon.reduce(
    (xys, [y, x]) => {
      xys[0].push(x);
      xys[1].push(y);
      return xys;
    },
    [[], []] as [number[], number[]]
  );
  const nvert = vertx.length;
  let c = false;

  let j = nvert - 1;
  for (let i = 0; i < nvert; j = i++) {
    if (verty[i] > y != verty[j] > y && x < ((vertx[j] - vertx[i]) * (y - verty[i])) / (verty[j] - verty[i]) + vertx[i])
      c = !c;
  }
  return `${y},${x} is ${c ? 'inside' : 'outside'} the polygon`;
}

export async function getMapUrl(polygons: Array<Coord[]>) {
  const baseUrl = `https://image.maps.ls.hereapi.com/mia/1.6/region?apiKey=${hereApiKey}&t=3&h=800&w=800`;
  const coords = polygons.map((polygon, i) => polygon.reduce((str, [y, x]) => `${str}${y},${x},`, `&a${i}=`));
  const response = await fetch(baseUrl + coords + '&fc0=5000FF00');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
