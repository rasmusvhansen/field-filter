import { Coord, getMapUrl, pointInPoly } from './coords';
import { useEffect, useState } from 'preact/hooks';
const brabrand: Coord[] = [
  [56.16087927816185, 10.105038391804111],
  [56.16028182448348, 10.11027406337594],
  [56.159158586411586, 10.109372841220132],
  [56.15920638444541, 10.107784973612285],
  [56.15825041246916, 10.107355820204756],
  [56.15860890474803, 10.104351746352068],
];
const poly1: Coord[] = [
  [1, 1],
  [5, 5],
  [4, 6],
  [0, 2],
];
export function App() {
  const [img, setImg] = useState('');
  useEffect(() => {
    getMapUrl([brabrand]).then((url) => setImg(url));
  }, []);
  return (
    <>
      <div>
        <img src={img} alt="" />
      </div>
      <p>Indenfor {pointInPoly(brabrand, [56.15976869272208, 10.107111589895874])}</p>
      <p>Indenfor {pointInPoly(brabrand, [56.16014891606887, 10.109797186864864])}</p>
      <p>Indenfor {pointInPoly(brabrand, [56.1588392420307, 10.10513911754577])}</p>
      <p>Udenfor {pointInPoly(brabrand, [56.15873784604939, 10.108431629084023])}</p>
      <p>Udenfor {pointInPoly(brabrand, [56.160757265595734, 10.10148245726596])}</p>
      <p>Udenfor {pointInPoly(brabrand, [56.15813791435047, 10.106944688389326])}</p>
    </>
  );
}
