import Link from "next/link";
import React from "react";
import {
  getSheetId,
  getRanges,
  getDrivers,
  rangeToSlug,
} from "../../utils/sheets";
import { getLeaderboard, DriverScore } from "../../utils/leaderboard";
import Header from "../../components/Header/Header";

interface PageParams {
  params: {
    season: string;
  };
}

export default async function Page({ params }: PageParams) {
  const sheetId = await getSheetId(params.season);
  const ranges = await getRanges(sheetId);
  const drivers = await getDrivers(sheetId);
  const leaderboard = await getLeaderboard(sheetId, ranges);
  const eventTally = {
    sealed: 0,
    unsealed: 0,
  };

  function Leaderboard({
    data,
    context,
  }: {
    data: DriverScore[];
    context?: "sealed" | "unsealed";
  }): JSX.Element {
    if (!data.length) {
      return (
        <p>
          <i>No results</i>
        </p>
      );
    }

    const sortedData = context
      ? (data.sort(
          (a, b) => b.totals[context] - a.totals[context]
        ) as (DriverScore & { position: number })[])
      : (data.sort(
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

            return <></>;
          })}
        </tbody>
      </table>
    );
  }

  for (let i = 0; i < ranges.length; i += 1) {
    if (ranges[i].toUpperCase().endsWith(" (SS)")) {
      eventTally.sealed += 1;
    } else if (ranges[i].toUpperCase().endsWith(" (USS)")) {
      eventTally.unsealed += 1;
    }
  }

  return (
    <>
      <Header heading={`${params.season} Season}`} />

      <p>
        <Link href="/">&larr; Back to Home</Link>
      </p>

      <h2>Event Results</h2>
      <ul>
        {ranges.map((range, index) => {
          if (index === 0) {
            return <React.Fragment key={index}></React.Fragment>;
          }

          return (
            <li key={index}>
              <Link href={`/${params.season}/${rangeToSlug(range)}`}>
                {range}
              </Link>
            </li>
          );
        })}
      </ul>

      <h2>Leaderboard</h2>
      <h3>Overall</h3>
      <Leaderboard data={leaderboard} />

      <h3>Sealed Surface</h3>
      <Leaderboard data={leaderboard} context="sealed" />

      <h3>Unsealed Surface</h3>
      <Leaderboard data={leaderboard} context="unsealed" />

      <h2>Registered Drivers</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver, index) => {
            if (driver) {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{driver}</td>
                </tr>
              );
            }

            return <React.Fragment key={index}></React.Fragment>;
          })}
        </tbody>
      </table>
    </>
  );
}
