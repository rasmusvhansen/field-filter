import { useRef } from 'preact/hooks';
import { utils, writeFile } from 'xlsx';
import { Area, pointInPoly, ResultCoord } from './coords';
const MS_PER_MINUTE = 1000 * 60;

interface Row {
  DateTimeStart: string;
  DateTime: string;
  DateTimeEnd: string;
  Coordinates: string;
  Duration: string;
  Status: 'Stationary' | 'Start' | 'End' | 'Moving';
}

export function CsvUpload({ fields, areas, onUpload }: { onUpload: (track: ResultCoord[]) => void; fields: Area[]; areas: Area[] }) {
  const fileRef = useRef<HTMLInputElement>();

  function handleFile(e: any) {
    var files = e.target.files,
      f = files[0];
    var reader = new FileReader();
    reader.addEventListener('load', function (e: any) {
      const csv = reader.result as string;
      const lines = csv.split('\n').slice(1, -1);
      const rows: ResultCoord[] = lines
        .map((r, i) => {
          const data = r.slice(1, -1).split(',');
          // lat,       lng,              timestamp,          speed,altitude,course,sats,hdop,accuracy
          // 56.044888, 9.300113999999999,2021-04-30 00:04:05,0,    74,      196,   13,  null,5
          const lat = +data[0];
          const lon = +data[1];
          const timestamp = new Date(data[2]);
          const accurate = +data[8] < 100;
          const nextTimestamp = lines[i + 1]?.slice(1, -1).split(',')[2];
          const durationInMinutes = nextTimestamp ? (new Date(nextTimestamp).valueOf() - timestamp.valueOf()) / MS_PER_MINUTE : 0;
          return {
            coord: `${lat}, ${lon}`,
            date: timestamp,
            timeOfDay: timestamp.toTimeString().slice(0, 8),
            inArea: areas
              .filter((a) => pointInPoly(a.coords, [lat, lon]))
              .map((f) => f.id)
              .join(', '),
            inField: fields
              .filter((f) => pointInPoly(f.coords, [lat, lon]))
              .map((f) => f.id)
              .join(', '),
            durationInMinutes,
            accurate,
          };
        })
        .filter((r) => r.accurate);

      const book = utils.book_new();
      utils.book_append_sheet(book, utils.json_to_sheet(rows));
      writeFile(book, 'result.xlsx');
      fileRef.current.value = '';
      onUpload(rows);
    });

    reader.readAsText(f);
  }

  return (
    <div>
      <p>Vælg CSV fil fra LightBug export.</p>
      <input type="file" name="upload" id="" onChange={(e) => handleFile(e)} ref={fileRef} accept="text/csv" />{' '}
    </div>
  );
}
