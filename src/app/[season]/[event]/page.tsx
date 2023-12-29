import Link from "next/link";
import React from "react";
import {
  getSheetId,
  getRanges,
  rangeToSlug,
  getEventResults,
} from "../../../utils/sheets";
import styles from "./event.module.css";

interface PageParams {
  params: {
    season: string;
    event: string;
  };
}

interface EventResult {
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
  gap: number;
  gap1st: number;
}

// TODO env var
const maxPoints = 50;

function resultToNumber(result: string) {
  const parsedResult = parseFloat(result?.replaceAll("*", ""));

  if (!result || isNaN(parsedResult)) {
    return Infinity;
  }

  return parsedResult;
}

function resultClass(result: string) {
  if (!result || result.toUpperCase() === "X") {
    return styles.blank;
  }

  if (result === "WT" || result === "DNF") {
    return styles.wt;
  }

  if (result.endsWith("*")) {
    return styles.bold;
  }
}

function ClassTable({ data }: { data: EventResult[] }) {
  if (!data.length) {
    return (
      <p>
        <i>No results</i>
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Driver</th>
          <th>Car</th>
          <th>1st</th>
          <th>2nd</th>
          <th>3rd</th>
          <th>4th</th>
          <th>5th</th>
          <th>6th</th>
          <th>Best</th>
          {/* <th>Points</th> */}
        </tr>
      </thead>
      <tbody>
        {data.map((result, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{result.name}</td>
              <td>{result.car}</td>
              <td className={resultClass(result.run1)}>{result.run1}</td>
              <td className={resultClass(result.run2)}>{result.run2}</td>
              <td className={resultClass(result.run3)}>{result.run3}</td>
              <td className={resultClass(result.run4)}>{result.run4}</td>
              <td className={resultClass(result.run5)}>{result.run5}</td>
              <td className={resultClass(result.run6)}>{result.run6}</td>
              <td>{isFinite(result.best) ? result.best : ""}</td>
              {/* <td>{Math.max(maxPoints - index, 1)}</td> */}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function Page({ params }: PageParams) {
  const sheetId = await getSheetId(params.season);
  const ranges = await getRanges(sheetId);
  const range = ranges.filter((item) => params.event === rangeToSlug(item))[0];
  let results;
  let overallData = [] as EventResult[];

  if (!range) {
    throw new Error("Failed to fetch data");
  }

  results = await getEventResults(sheetId, range);

  results = results.filter((item) => item.length > 3);

  overallData = results.map((result) => {
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
  });

  overallData.sort((a, b) => a.best - b.best);
  overallData.sort(function (a, b) {
    /* TODO
    if (a.best === b.best) {
      // TODO Tie break by looking at WT/DNF? Check regs
      const aBad = [a.run1, a.run2, a.run3, a.run4, a.run5, a.run6].filter(
        (item) => item === "WT" || item === "DNF"
      );
      const bBad = [b.run1, b.run2, b.run3, b.run4, b.run5, b.run6].filter(
        (item) => item === "WT" || item === "DNF"
      );
      return aBad.length - bBad.length;
    }
     */

    return a.best - b.best;
  });

  for (let i = 0; i < overallData.length; i += 1) {
    if (i === 0) {
      overallData[i].gap = 0;
      overallData[i].gap1st = 0;
    } else {
      overallData[i].gap = parseFloat(
        (overallData[i].best - overallData[i - 1].best).toFixed(2)
      );
      overallData[i].gap1st = parseFloat(
        (overallData[i].best - overallData[0].best).toFixed(2)
      );
    }
  }

  return (
    <>
      <h1>Results: {range}</h1>

      <p>
        <Link href={`/${params.season}`}>
          &lt; Back to {params.season} Season
        </Link>
      </p>

      <h2>Overall</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Driver</th>
            <th>Car</th>
            <th>Class</th>
            <th>1st</th>
            <th>2nd</th>
            <th>3rd</th>
            <th>4th</th>
            <th>5th</th>
            <th>6th</th>
            <th>Best</th>
            <th>Gap</th>
            <th>Gap 1st</th>
            {/* <th>Points</th> */}
          </tr>
        </thead>
        <tbody>
          {overallData.map((result, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{result.name}</td>
                <td>{result.car}</td>
                <td>{result.class}</td>
                <td className={resultClass(result.run1)}>{result.run1}</td>
                <td className={resultClass(result.run2)}>{result.run2}</td>
                <td className={resultClass(result.run3)}>{result.run3}</td>
                <td className={resultClass(result.run4)}>{result.run4}</td>
                <td className={resultClass(result.run5)}>{result.run5}</td>
                <td className={resultClass(result.run6)}>{result.run6}</td>
                <td>{isFinite(result.best) ? result.best : ""}</td>
                <td>{isFinite(result.gap) ? result.gap : ""}</td>
                <td>{isFinite(result.gap1st) ? result.gap1st : ""}</td>
                {/* <td>{Math.max(maxPoints - index, 1)}</td> */}
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>By Class</h2>
      <h3>Class 1</h3>
      <ClassTable data={overallData.filter((result) => result.class === "1")} />
      <h3>Class 2</h3>
      <ClassTable data={overallData.filter((result) => result.class === "2")} />
      <h3>Class 3</h3>
      <ClassTable data={overallData.filter((result) => result.class === "3")} />
      <h3>Class 4</h3>
      <ClassTable data={overallData.filter((result) => result.class === "4")} />
      <h3>Class 5</h3>
      <ClassTable data={overallData.filter((result) => result.class === "5")} />
    </>
  );
}
