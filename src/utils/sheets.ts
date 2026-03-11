const key = process.env.API_KEY;
// Get files list for "Live Timing" folder
const folderId = process.env.FOLDER_ID;

type SheetsFile = {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
};

export type EventResult = {
  name: string;
  car: string;
  class: string;
  run1: string;
  run2: string;
  run3: string;
  run4: string;
  run5: string;
  run6: string;
  best: number;
};

export type SortedEventResult = EventResult & {
  position?: number;
  gap?: number;
  gap1st?: number;
};

/**
 * @returns A string representing the slug of the range.
 * @description The slug is the slug of the range.
 * The slug is the range in the spreadsheet.
 */
export function rangeToSlug(range: string): string {
  return range
    .replaceAll(" - ", " ")
    .replaceAll("/", "-")
    .replaceAll(" ", "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * @returns A number representing the result.
 * @description The result is the result of the event.
 * The result is the best time of the event.
 */
function resultToNumber(result: string): number {
  const parsedResult = parseFloat(result?.replaceAll("*", ""));

  if (!result || isNaN(parsedResult)) {
    return Infinity;
  }

  return parsedResult;
}

/**
 * @returns An array of strings representing the names of the sheets in the spreadsheet.
 * @description The names are the names of the sheets in the spreadsheet.
 */
export async function getSheetNames(): Promise<string[]> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents&key=${key}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    return [];
  }

  const sheets = await res.json();
  const names = sheets.files.map((file: SheetsFile) => file.name);

  return names;
}

/**
 * @returns The ID of the sheet for the given season.
 * @description The ID is the ID of the sheet in the spreadsheet.
 */
export async function getSheetId(season: string): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents&key=${key}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    return null;
  }

  const sheets = await res.json();
  const sheet = sheets.files.filter((file: SheetsFile) => file.name === season);

  return sheet[0]?.id || null;
}

/**
 * @returns An array of strings representing the ranges in the sheet.
 * @description The array represents the ranges in the sheet.
 * The ranges are the titles of the sheets in the spreadsheet.
 */
export async function getRanges(sheetId: string): Promise<string[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${key}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    return [];
  }

  const sheets = await res.json();

  return sheets.sheets.map(
    (sheet: { properties: { title: string } }) => sheet.properties.title,
  );
}

export async function getDrivers(sheetId: string): Promise<string[]> {
  const range = "Drivers!A:A";
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${key}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    return [];
  }

  const drivers = await res.json();

  return drivers.values.map((driver: string[]) => driver[0]);
}

/**
 * @returns An array of strings representing the championship configuration.
 * @description The array represents the championship configuration.
 * The first element is the number of SS rounds to count.
 * The second element is the number of USS rounds to count.
 */
export async function getConfig(sheetId: string): Promise<string[]> {
  const range = "Config!A:A";
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${key}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    return [];
  }

  const drivers = await res.json();

  return drivers.values.map((config: string[]) => config[0]);
}

/**
 * @returns An array of strings representing the event results.
 * @description The array represents the event results.
 */
export async function getEventResults(
  sheetId: string,
  range: string,
): Promise<EventResult[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'${encodeURIComponent(
      range,
    )}'?key=${key}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) {
    return [];
  }

  const drivers = await res.json();

  let overallData: EventResult[] = drivers.values
    .filter((item: string[]) => item.length > 3)
    .map((result: string[]) => {
      return {
        name: result[0],
        car: result[1],
        class: result[2],
        run1: result[3],
        run2: result[4],
        run3: result[5],
        run4: result[6],
        run5: result[7],
        run6: result[8],
        best: Math.min(
          resultToNumber(result[3]),
          resultToNumber(result[4]),
          resultToNumber(result[5]),
          resultToNumber(result[6]),
          resultToNumber(result[7]),
          resultToNumber(result[8]),
        ),
        gap: 0,
        gap1st: 0,
      };
    });

  overallData.sort(function (a, b) {
    return a.best - b.best;
  });

  return overallData;
}
