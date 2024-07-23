import React from "react";
import type { DriverScore } from "../../utils/leaderboard";
import type { LeaderboardProps } from "./leaderboard.types";

const Leaderboard = ({
  ranges,
  leaderboard,
  context,
}: LeaderboardProps): JSX.Element => {
  const eventTally = {
    sealed: 0,
    unsealed: 0,
  };

  for (let i = 0; i < ranges.length; i += 1) {
    if (ranges[i].toUpperCase().endsWith(" (SS)")) {
      eventTally.sealed += 1;
    } else if (ranges[i].toUpperCase().endsWith(" (USS)")) {
      eventTally.unsealed += 1;
    }
  }

  if (!leaderboard.length) {
    return (
      <p>
        <i>No results</i>
      </p>
    );
  }

  const sortedData = context
    ? (leaderboard.sort(
        (a, b) => b.totals[context] - a.totals[context]
      ) as (DriverScore & { position: number })[])
    : (leaderboard.sort(
        (a, b) =>
          b.totals.sealed +
          b.totals.unsealed -
          (a.totals.sealed + a.totals.unsealed)
      ) as (DriverScore & { position: number })[]);
  let position = 0;

  for (let i = 0; i < sortedData.length; i += 1) {
    const prevTotals = context
      ? sortedData[i - 1]?.totals[context]
      : sortedData[i - 1]?.totals.sealed + sortedData[i - 1]?.totals.unsealed;
    const totals = context
      ? sortedData[i].totals[context]
      : sortedData[i].totals.sealed + sortedData[i].totals.unsealed;

    if (i === 0 || prevTotals > totals) {
      position += 1;
    }

    sortedData[i].position = position;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Class</th>
          <th>Events</th>
          <th>WT/DNF</th>
          <th>Drop</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((driver, index) => {
          if (context) {
            if (driver.points[context].length) {
              return (
                <tr key={index}>
                  <td>{driver.position}</td>
                  <td>{driver.name}</td>
                  <td>{driver.classes[context]}</td>
                  <td>
                    {driver.points[context].length +
                      driver.drops[context].length}{" "}
                    / {eventTally[context]}
                  </td>
                  <td>{driver.wt[context]}</td>
                  <td>{driver.drops[context].join(" + ")}</td>
                  <td>{driver.totals[context]}</td>
                </tr>
              );
            }

            return <></>;
          }

          if (driver.points.sealed.length || driver.points.unsealed.length) {
            return (
              <tr key={index}>
                <td>{driver.position}</td>
                <td>{driver.name}</td>
                <td>
                  {driver.classes.sealed ? driver.classes.sealed : <></>}
                  {driver.classes.sealed > 0 && <small> (SS)</small>}
                  {driver.classes.sealed && driver.classes.unsealed ? (
                    <> / </>
                  ) : (
                    <></>
                  )}
                  {driver.classes.unsealed ? driver.classes.unsealed : <></>}
                  {driver.classes.unsealed > 0 && <small> (USS)</small>}
                </td>
                <td>
                  {driver.points.sealed.length +
                    driver.points.unsealed.length +
                    driver.drops.sealed.length +
                    driver.drops.unsealed.length}{" "}
                  / {eventTally.sealed + eventTally.unsealed}
                </td>
                <td>{driver.wt.sealed + driver.wt.unsealed}</td>
                <td>
                  {driver.drops.sealed.length ? (
                    <>
                      {driver.drops.sealed.join(" + ")}
                      <small> (SS)</small>
                    </>
                  ) : (
                    <></>
                  )}
                  {driver.drops.sealed.length &&
                  driver.drops.unsealed.length ? (
                    <> / </>
                  ) : (
                    <></>
                  )}
                  {driver.drops.unsealed.length ? (
                    <>
                      {driver.drops.unsealed.join(" + ")}
                      <small> (USS)</small>
                    </>
                  ) : (
                    <></>
                  )}
                </td>
                <td>{driver.totals.sealed + driver.totals.unsealed}</td>
              </tr>
            );
          }

          return <React.Fragment key={index}></React.Fragment>;
        })}
      </tbody>
    </table>
  );
};

export default Leaderboard;
