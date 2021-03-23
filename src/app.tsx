import { Area, Coord, CoordWithTime, getMapUrl, parsePositionFile, pointInPoly } from './coords';
import { useEffect, useState } from 'preact/hooks';
import useLocalStorage from './hooks/useLocalStorage';
import { ExcelUpload } from './ExcelUpload';
import './app.css';
const DEFAULT_COLOR = '#0000ff';

function without<T>(rec: Record<string, T>, id: string): Record<string, T> {
  const { [id]: value, ...rest } = rec;
  return rest;
}

export function App() {
  const path = location.pathname.slice(1);
  const getId = (id: string) => `${path}-${id}`;
  const [img, setImg] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [track, setTrack] = useState<CoordWithTime[]>([]);
  const [areas, setAreas] = useLocalStorage<Record<string, Area>>(getId('areas'), {});
  const [fields, setFields] = useLocalStorage<Record<string, Area>>(getId('fields'), {});
  const removeField = (id: string) => {
    setFields(without(fields, id));
  };
  const removeArea = (id: string) => {
    setAreas(without(areas, id));
  };
  const createField = () => {
    if (fieldName) {
      setFields({ ...fields, [fieldName]: { id: fieldName, coords: [], color: DEFAULT_COLOR } });
      setFieldName('');
    }
  };

  const createArea = () => {
    if (areaName) {
      setAreas({ ...areas, [areaName]: { id: areaName, coords: [], color: DEFAULT_COLOR } });
      setAreaName('');
    }
  };
  useEffect(() => {
    getMapUrl(
      Object.values(areas)
        .filter((a) => a.coords.length)
        .concat(Object.values(fields).filter((a) => a.coords.length))
    ).then((url) => setImg(url));
  }, [areas, fields]);
  return (
    <>
      <ExcelUpload
        onUpload={(t) => console.log(t)}
        fields={Object.values(fields)}
        areas={Object.values(areas)}
      ></ExcelUpload>
      <div class="area-wrapper">
        <div>
          <h3>Marker</h3>
          <div>
            <input type="text" value={fieldName} onChange={(e) => setFieldName(e.currentTarget.value)} />
            <button onClick={createField}>Opret Mark</button>
          </div>
          {Object.values(fields).map((field) => (
            <Polygon
              key={field.id}
              area={field}
              onUpload={(area) => setFields({ ...fields, [area.id]: area })}
              onDelete={removeField}
            ></Polygon>
          ))}
        </div>
        <div class="areas">
          <h3>Skovområder</h3>
          <div>
            <input type="text" onChange={(e) => setAreaName(e.currentTarget.value)} />
            <button onClick={createArea}>Opret Skovområde</button>
          </div>
          {Object.values(areas).map((area) => (
            <Polygon
              key={area.id}
              area={area}
              onUpload={(area) => setAreas({ ...areas, [area.id]: area })}
              onDelete={removeArea}
            ></Polygon>
          ))}
        </div>
      </div>

      <div>
        <img src={img} alt="" />
      </div>
    </>
  );
}

function Polygon({
  area,
  onUpload,
  onDelete,
}: {
  area: Area;
  onUpload: (area: Area) => void;
  onDelete: (id: string) => void;
}) {
  const [color, setColor] = useState(area?.color || '#0000ff');
  const [newArea, setNewArea] = useState<Area | null>(null);
  useEffect(() => {
    const a = newArea ? newArea : area.coords.length ? area : null;
    if (a) {
      setNewArea({ ...a, color });
    }
  }, [color]);
  useEffect(() => {
    if (newArea) {
      onUpload(newArea);
    }
  }, [newArea]);
  const loadFile = (e: any) => {
    console.log(e.target!.files[0]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setNewArea({ id: area.id, coords: parsePositionFile(text)[0], color });
      }
    };
    reader.readAsText(e.target!.files[0]);
  };
  return (
    <div>
      {area.id} <input type="file" name={area.id} id={area.id} onChange={(e) => loadFile(e)} />{' '}
      <input type="color" value={color} onChange={(e: any) => setColor(e.target.value)} />
      <button onClick={() => onDelete(area.id)}>Slet</button>
    </div>
  );
}
