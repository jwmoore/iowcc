import { getEventResults, getDrivers } from "./sheets";

export interface DriverScore {
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
}

const maxPoints = 50;

function tallyWtDnf(score: string | undefined) {
  if (score && /WT|DNF/.test(score.toUpperCase())) {
    return 1;
  }

  return 0;
}

export async function getLeaderboard(sheetId: string, ranges: string[]) {
  const drivers = await getDrivers(sheetId);
  const results = [];
  const leaderboard = [] as DriverScore[];

  for (let i = 0; i < ranges.length; i += 1) {
    results.push(await getEventResults(sheetId, ranges[i]));
  }

  for (let i = 0; i < drivers.length; i += 1) {
    let sealedPoints = [];
    let unsealedPoints = [];
    let sealedDrop = [];
    let unsealedDrop = [];
    let sealedEvents = 0;
    let unsealedEvents = 0;
    let sealedWt = 0;
    let unsealedWt = 0;
    let sealedClass = 0;
    let unsealedClass = 0;

    for (let j = 0; j < results.length; j += 1) {
      for (let k = 0; k < results[j].length; k += 1) {
        if (drivers[i] === results[j][k].name) {
          if (ranges[j].toUpperCase().endsWith(" (SS)")) {
            sealedPoints.push(Math.max(maxPoints - k, 1));
            sealedEvents += 1;
            sealedWt += tallyWtDnf(results[j][k].run1);
            sealedWt += tallyWtDnf(results[j][k].run2);
            sealedWt += tallyWtDnf(results[j][k].run3);
            sealedWt += tallyWtDnf(results[j][k].run4);
            sealedWt += tallyWtDnf(results[j][k].run5);
            sealedWt += tallyWtDnf(results[j][k].run6);
            sealedClass = Math.max(parseInt(results[j][k].class), sealedClass);
          } else if (ranges[j].toUpperCase().endsWith(" (USS)")) {
            unsealedPoints.push(Math.max(maxPoints - k, 1));
            unsealedEvents += 1;
            unsealedWt += tallyWtDnf(results[j][k].run1);
            unsealedWt += tallyWtDnf(results[j][k].run2);
            unsealedWt += tallyWtDnf(results[j][k].run3);
            unsealedWt += tallyWtDnf(results[j][k].run4);
            unsealedWt += tallyWtDnf(results[j][k].run5);
            unsealedWt += tallyWtDnf(results[j][k].run6);
            unsealedClass = Math.max(
              parseInt(results[j][k].class),
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
