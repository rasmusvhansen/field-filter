import { hereApiKey } from './secret';

export type Coord = [number, number];
export interface Area {
  id: string;
  coords: Coord[];
  color: string;
}

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

export async function getMapUrl(areas: Array<Area>) {
  const baseUrl = `https://image.maps.ls.hereapi.com/mia/1.6/region?apiKey=${hereApiKey}&t=3&h=800&w=800`;
  const coords = areas.map((area, i) =>
    area.coords.reduce((str, [y, x]) => `${str}${y},${x},`, `&fc${i}=50${area.color.slice(1)}&a${i}=`)
  );
  const response = await fetch(baseUrl + coords + ``);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function parsePositionFile(text: string): Coord[][] {
  const polygons = text.split('\n');
  return polygons.map(
    (p) =>
      chunk(
        p.split(',').map((c) => Number(c.trim())),
        2
      ) as Coord[]
  );
}

function chunk<T>(arr: Array<T>, chunkSize: number) {
  if (chunkSize <= 0) throw 'Invalid chunk size';
  const res = [];
  for (var i = 0, len = arr.length; i < len; i += chunkSize) res.push(arr.slice(i, i + chunkSize));
  return res;
}
