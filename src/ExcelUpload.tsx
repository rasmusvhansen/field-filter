import { useRef } from 'preact/hooks';
import { read, utils, WorkSheet, writeFile } from 'xlsx';
import { Area, Coord, CoordWithTime, pointInPoly, ResultCoord } from './coords';
const MS_PER_MINUTE = 1000 * 60;
interface Row {
  DateTimeStart: string;
  DateTime: string;
  DateTimeEnd: string;
  Coordinates: string;
  Duration: string;
  Status: 'Stationary' | 'Start' | 'End' | 'Moving';
}

export function ExcelUpload({
  fields,
  areas,
  onUpload,
}: {
  onUpload: (track: CoordWithTime[]) => void;
  fields: Area[];
  areas: Area[];
}) {
  const fileRef = useRef<HTMLInputElement>();

  function handleFile(e: any) {
    var files = e.target.files,
      f = files[0];
    var reader = new FileReader();
    reader.onload = function (e: any) {
      var data = new Uint8Array(e.target.result);
      var workbook = read(data, { type: 'array' });
      const sheet = Object.values(workbook.Sheets)[0];

      skipFirstRows(sheet);
      const rows: Row[] = utils.sheet_to_json(sheet);

      const mapped: CoordWithTime[] = rows
        .filter((r) => !['Start', 'End'].includes(r.Status))
        .map((r, index, arr) => ({
          coord: r.Coordinates.split(/\s|,\s/).map((l) => +l) as [number, number],
          date: new Date(r.DateTime || r.DateTimeStart),
          status: r.Status,
          durationInMinutes:
            r.Status === 'Stationary'
              ? (new Date(r.DateTimeEnd).getTime() - new Date(r.DateTimeStart).getTime()) / MS_PER_MINUTE
              : arr[index + 1]
              ? (new Date(arr[index + 1].DateTime || arr[index + 1].DateTimeStart).getTime() -
                  new Date(r.DateTime).getTime()) /
                MS_PER_MINUTE
              : 5,
        }));

      const result: ResultCoord[] = mapped.map((c) => ({
        ...c,
        timeOfDay: c.date.toISOString().slice(11, 19),
        coord: `${c.coord[0]}, ${c.coord[1]}`,
        inField: fields
          .filter((f) => pointInPoly(f.coords, c.coord))
          .map((f) => f.id)
          .join(', '),
        inArea: areas
          .filter((a) => pointInPoly(a.coords, c.coord))
          .map((f) => f.id)
          .join(', '),
      }));
      console.log(result);
      const book = utils.book_new();
      utils.book_append_sheet(book, utils.json_to_sheet(result));
      writeFile(book, 'result.xlsx');
      fileRef.current.value = '';
    };

    reader.readAsArrayBuffer(f);
  }

  return (
    <div>
      <input type="file" name="upload" id="" onChange={(e) => handleFile(e)} ref={fileRef} />{' '}
    </div>
  );
}
function skipFirstRows(sheet: WorkSheet) {
  const ref = sheet['!ref'];
  console.log('sheet', sheet);
  const range = utils.decode_range(ref!);
  /* skip n rows */
  range.s.r += 5;
  if (range.s.r >= range.e.r) range.s.r = range.e.r;
  /* update range */
  sheet['!ref'] = utils.encode_range(range);
}
