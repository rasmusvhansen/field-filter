import { Area, Coord, CoordWithTime, getMapUrl, parsePositionFile, pointInPoly } from './coords';
import { useEffect, useState } from 'preact/hooks';
import useLocalStorage from './hooks/useLocalStorage';
import { ExcelUpload } from './ExcelUpload';
const brabrand: Coord[] = [
  [56.16087927816185, 10.105038391804111],
  [56.16028182448348, 10.11027406337594],
  [56.159158586411586, 10.109372841220132],
  [56.15920638444541, 10.107784973612285],
  [56.15825041246916, 10.107355820204756],
  [56.15860890474803, 10.104351746352068],
];

export function App() {
  const [img, setImg] = useState('');
  const [track, setTrack] = useState<CoordWithTime[]>([]);
  const [areas, setAreas] = useState<Record<string, Area>>({});
  const [fields, setFields] = useState<Record<string, Area>>({});
  useEffect(() => {
    getMapUrl(Object.values(areas)).then((url) => setImg(url));
  }, [areas]);
  return (
    <>
      <ExcelUpload
        onUpload={(t) => console.log(t)}
        fields={Object.values(fields)}
        areas={Object.values(areas)}
      ></ExcelUpload>
      <FileUpload id="Mark1" handleUpload={(area) => setAreas((prev) => ({ ...prev, [area.id]: area }))}></FileUpload>
      <FileUpload id="Mark2" handleUpload={(area) => setAreas((prev) => ({ ...prev, [area.id]: area }))}></FileUpload>
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

function FileUpload(props: { id: string; handleUpload: (area: Area) => void }) {
  const [area, setArea] = useLocalStorage<Area | null>(props.id, null);
  const [color, setColor] = useState(area?.color || '#0000ff');
  useEffect(() => {
    if (area) {
      setArea({ ...area, color });
    }
  }, [color]);
  useEffect(() => {
    if (area) {
      props.handleUpload(area);
    }
  }, [area]);
  const loadFile = (e: any) => {
    console.log(e.target!.files[0]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setArea({ id: props.id, coords: parsePositionFile(text)[0], color });
      }
    };
    reader.readAsText(e.target!.files[0]);
  };
  return (
    <div>
      {props.id} <input type="file" name="upload" id="" onChange={(e) => loadFile(e)} />{' '}
      <input type="color" value={color} onChange={(e: any) => setColor(e.target.value)} />
    </div>
  );
}
