import Link from "next/link";
import React from "react";
import {
  getSheetId,
  getRanges,
  getDrivers,
  rangeToSlug,
} from "../../utils/sheets";

interface PageParams {
  params: {
    season: string;
  };
}

export default async function Page({ params }: PageParams) {
  const sheetId = await getSheetId(params.season);
  const ranges = await getRanges(sheetId);
  const drivers = await getDrivers(sheetId);

  return (
    <>
      <h1>{params.season} Season</h1>

      <p>
        <Link href="/">&lt; Back to Home</Link>
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
