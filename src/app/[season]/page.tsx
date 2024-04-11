import Link from "next/link";
import React from "react";
import {
  getSheetId,
  getRanges,
  getDrivers,
  rangeToSlug,
} from "../../utils/sheets";
import { getLeaderboard } from "../../utils/leaderboard";
import Header from "../../components/header/header";
import Leaderboard from "../../components/leaderboard/leaderboard";
import { notFound } from "next/navigation";

type PageParams = {
  params: {
    season: string;
  };
};

export default async function Page({ params }: PageParams) {
  const sheetId = await getSheetId(params.season);

  if (!sheetId) {
    return notFound();
  }

  const ranges = await getRanges(sheetId);
  const drivers = await getDrivers(sheetId);
  const leaderboard = await getLeaderboard(sheetId, ranges);

  return (
    <>
      <Header heading={`${params.season} Season`} />

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
      <Leaderboard leaderboard={leaderboard} ranges={ranges} />

      <h3>Sealed Surface</h3>
      <Leaderboard leaderboard={leaderboard} ranges={ranges} context="sealed" />

      <h3>Unsealed Surface</h3>
      <Leaderboard
        leaderboard={leaderboard}
        ranges={ranges}
        context="unsealed"
      />

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
