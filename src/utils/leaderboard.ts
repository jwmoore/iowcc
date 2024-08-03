import {
  getEventResults,
  getDrivers,
  EventResult,
  SortedEventResult,
} from "./sheets";

export type DriverScore = {
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
  const sortedData = data.sort(
    (a, b) => a.best - b.best
  ) as SortedEventResult[];
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
        (sortedData[i].best - sortedData[i - 1].best).toFixed(2)
      );
      sortedData[i].gap1st = parseFloat(
        (sortedData[i].best - sortedData[0].best).toFixed(2)
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

function hasValidResult(result: EventResult) {
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

export async function getLeaderboard(sheetId: string, ranges: string[]) {
  const maxPoints = 50;
  const drivers = await getDrivers(sheetId);
  const results = [] as EventResult[][];
  const leaderboard = [] as DriverScore[];

  for (let i = 0; i < ranges.length; i += 1) {
    results.push(await getEventResults(sheetId, ranges[i]));
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
          if (ranges[j].toUpperCase().endsWith(" (SS)")) {
            sealedPoints.push(
              Math.max(maxPoints - (sortedResult[k].position - 1), 1)
            );
            sealedWt += tallyWtDnf(sortedResult[k].run1);
            sealedWt += tallyWtDnf(sortedResult[k].run2);
            sealedWt += tallyWtDnf(sortedResult[k].run3);
            sealedWt += tallyWtDnf(sortedResult[k].run4);
            sealedWt += tallyWtDnf(sortedResult[k].run5);
            sealedWt += tallyWtDnf(sortedResult[k].run6);
            sealedClass = Math.max(
              parseInt(sortedResult[k].class),
              sealedClass
            );
          } else if (ranges[j].toUpperCase().endsWith(" (USS)")) {
            unsealedPoints.push(
              Math.max(maxPoints - (sortedResult[k].position - 1), 1)
            );
            unsealedWt += tallyWtDnf(sortedResult[k].run1);
            unsealedWt += tallyWtDnf(sortedResult[k].run2);
            unsealedWt += tallyWtDnf(sortedResult[k].run3);
            unsealedWt += tallyWtDnf(sortedResult[k].run4);
            unsealedWt += tallyWtDnf(sortedResult[k].run5);
            unsealedWt += tallyWtDnf(sortedResult[k].run6);
            unsealedClass = Math.max(
              parseInt(sortedResult[k].class),
              unsealedClass
            );
          }
        }
      }
    }

    sealedPoints.sort((a, b) => b - a);
    unsealedPoints.sort((a, b) => b - a);
    sealedDrop = sealedPoints.slice(5);
    unsealedDrop = unsealedPoints.slice(5);
    sealedPoints = sealedPoints.slice(0, 5);
    unsealedPoints = unsealedPoints.slice(0, 5);

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
          0
        ),
        unsealed: unsealedPoints.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ),
      },
    });
  }

  return leaderboard;
}
