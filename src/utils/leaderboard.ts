import {
  getEventResults,
  getDrivers,
  EventResult,
  SortedEventResult,
  getConfig,
} from "./sheets";

export type LeaderboardRow = {
  name: string;
  classes: {
    sealed: number;
    unsealed: number;
  };
  points: {
    sealed: number[];
    unsealed: number[];
  };
  drops: {
    sealed: number[];
    unsealed: number[];
  };
  wt: {
    sealed: number;
    unsealed: number;
  };
  totals: {
    sealed: number;
    unsealed: number;
  };
};

export function setPosition(data: EventResult[]) {
  const sortedData: SortedEventResult[] = data.sort((a, b) => a.best - b.best);
  let position = 0;

  for (let i = 0; i < sortedData.length; i += 1) {
    // set position
    if (i === 0 || sortedData[i - 1].best < sortedData[i].best) {
      position += 1;
    }

    sortedData[i].position = position;

    // set gaps
    if (i === 0) {
      sortedData[i].gap = 0;
      sortedData[i].gap1st = 0;
    } else {
      sortedData[i].gap = parseFloat(
        (sortedData[i].best - sortedData[i - 1].best).toFixed(2),
      );
      sortedData[i].gap1st = parseFloat(
        (sortedData[i].best - sortedData[0].best).toFixed(2),
      );
    }
  }

  return sortedData;
}

function tallyWtDnf(score: string | undefined) {
  if (score && /WT|DNF/.test(score.toUpperCase())) {
    return 1;
  }

  return 0;
}

export function hasValidResult(result: EventResult) {
  const results = [
    result.run1,
    result.run2,
    result.run3,
    result.run4,
    result.run5,
    result.run6,
  ].filter((value) => {
    if (
      value &&
      (value.toUpperCase() === "WT" ||
        value.toUpperCase() === "DNF" ||
        value.endsWith("*") ||
        !isNaN(parseFloat(value)))
    ) {
      return true;
    }

    return false;
  });

  return Boolean(results.length);
}

export function isEventSheetTitle(title: string) {
  const t = title.toLowerCase();
  return t !== "drivers" && t !== "config";
}

export type RegisteredDriver = { number: number; name: string };

/**
 * Drivers listed on the Drivers sheet who have at least one valid scored row
 * (same rules as championship points) on any event sheet for the season.
 */
export async function getRegisteredDrivers(
  sheetId: string,
  ranges: string[],
): Promise<RegisteredDriver[]> {
  const eventRanges = ranges.filter(isEventSheetTitle);
  const driversFromSheet = await getDrivers(sheetId);
  const allEventResults = await Promise.all(
    eventRanges.map((range) => getEventResults(sheetId, range)),
  );
  const scoredNames = new Set<string>();

  for (const eventResults of allEventResults) {
    for (const row of eventResults) {
      if (hasValidResult(row)) {
        scoredNames.add(row.name);
      }
    }
  }

  return driversFromSheet
    .map((name, i) => ({ number: i + 1, name }))
    .filter(({ name }) => name && scoredNames.has(name));
}

export async function getLeaderboard(
  sheetId: string,
  ranges: string[],
  classNumber?: number,
) {
  const maxPoints = 50;
  const championshipConfig = await getConfig(sheetId);
  const ssRoundsToCount = parseInt(championshipConfig[0] || "5");
  const ussRoundsToCount = parseInt(championshipConfig[1] || "5");
  const drivers = await getDrivers(sheetId);
  const results: EventResult[][] = [];
  const leaderboard: LeaderboardRow[] = [];

  for (let i = 0; i < ranges.length; i += 1) {
    const eventResults = await getEventResults(sheetId, ranges[i]);

    results.push(
      eventResults.filter((eventResult) => {
        return classNumber
          ? eventResult.class === classNumber.toString()
          : true;
      }),
    );
  }

  for (let i = 0; i < drivers.length; i += 1) {
    let sealedPoints = [];
    let unsealedPoints = [];
    let sealedDrop = [];
    let unsealedDrop = [];
    let sealedWt = 0;
    let unsealedWt = 0;
    let sealedClass = 0;
    let unsealedClass = 0;

    for (let j = 0; j < results.length; j += 1) {
      const sortedResult = setPosition(results[j]);

      for (let k = 0; k < sortedResult.length; k += 1) {
        if (
          drivers[i] === sortedResult[k].name &&
          hasValidResult(sortedResult[k])
        ) {
          if (ranges[j].toUpperCase().includes("(SS)")) {
            sealedPoints.push(
              Math.max(maxPoints - ((sortedResult[k].position || 0) - 1), 1),
            );
            sealedWt += tallyWtDnf(sortedResult[k].run1);
            sealedWt += tallyWtDnf(sortedResult[k].run2);
            sealedWt += tallyWtDnf(sortedResult[k].run3);
            sealedWt += tallyWtDnf(sortedResult[k].run4);
            sealedWt += tallyWtDnf(sortedResult[k].run5);
            sealedWt += tallyWtDnf(sortedResult[k].run6);
            sealedClass = Math.max(
              parseInt(sortedResult[k].class),
              sealedClass,
            );
          } else if (ranges[j].toUpperCase().includes("(USS)")) {
            unsealedPoints.push(
              Math.max(maxPoints - ((sortedResult[k].position || 0) - 1), 1),
            );
            unsealedWt += tallyWtDnf(sortedResult[k].run1);
            unsealedWt += tallyWtDnf(sortedResult[k].run2);
            unsealedWt += tallyWtDnf(sortedResult[k].run3);
            unsealedWt += tallyWtDnf(sortedResult[k].run4);
            unsealedWt += tallyWtDnf(sortedResult[k].run5);
            unsealedWt += tallyWtDnf(sortedResult[k].run6);
            unsealedClass = Math.max(
              parseInt(sortedResult[k].class),
              unsealedClass,
            );
          }
        }
      }
    }

    sealedPoints.sort((a, b) => b - a);
    unsealedPoints.sort((a, b) => b - a);
    sealedDrop = sealedPoints.slice(ssRoundsToCount);
    unsealedDrop = unsealedPoints.slice(ussRoundsToCount);
    sealedPoints = sealedPoints.slice(0, ssRoundsToCount);
    unsealedPoints = unsealedPoints.slice(0, ussRoundsToCount);

    leaderboard.push({
      name: drivers[i],
      classes: {
        sealed: sealedClass,
        unsealed: unsealedClass,
      },
      points: {
        sealed: sealedPoints,
        unsealed: unsealedPoints,
      },
      drops: {
        sealed: sealedDrop,
        unsealed: unsealedDrop,
      },
      wt: {
        sealed: sealedWt,
        unsealed: unsealedWt,
      },
      totals: {
        sealed: sealedPoints.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        ),
        unsealed: unsealedPoints.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        ),
      },
    });
  }

  return leaderboard;
}
