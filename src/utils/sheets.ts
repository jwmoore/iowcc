const key = "AIzaSyCjPtdGtmKcPN4QCSlMrCiZNxIG1GQouoQ";
// Get files list for "Live Timing" folder
const folderId = "1bzRa7MfmtwnVUFWLjMcVZ3bUU_bUo73J";

interface SheetsFile {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
}

export interface EventResult {
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
}

export function rangeToSlug(range: string) {
  return range
    .replaceAll(" - ", " ")
    .replaceAll("/", "-")
    .replaceAll(" ", "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "") as string;
}

function resultToNumber(result: string) {
  const parsedResult = parseFloat(result?.replaceAll("*", ""));

  if (!result || isNaN(parsedResult)) {
    return Infinity;
  }

  return parsedResult;
}

export async function getSheetNames() {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents&key=${key}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const sheets = await res.json();
  const names = sheets.files.map((file: SheetsFile) => file.name);

  return names as string[];
}

export async function getSheetId(season: string) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents&key=${key}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const sheets = await res.json();
  const sheet = sheets.files.filter((file: SheetsFile) => file.name === season);

  return sheet[0].id as string;
}

export async function getRanges(sheetId: string) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${key}`,
    { next: { revalidate: 600 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const sheets = await res.json();

  return sheets.sheets.map(
    (sheet: { properties: { title: string } }) => sheet.properties.title
  ) as string[];
}

export async function getDrivers(sheetId: string) {
  const range = "Drivers!A:A";
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${key}`,
    { next: { revalidate: 600 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const drivers = await res.json();

  return drivers.values.map((driver: string[]) => driver[0]) as string[];
}

export async function getEventResults(sheetId: string, range: string) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'${encodeURIComponent(
      range
    )}'?key=${key}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const drivers = await res.json();

  let overallData = drivers.values
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
          resultToNumber(result[8])
        ),
        gap: 0,
        gap1st: 0,
      };
    }) as EventResult[];

  overallData.sort(function (a, b) {
    return a.best - b.best;
  });

  return overallData;
}
