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
import styles from "./page.module.css";

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
  const leaderboardClass1 = await getLeaderboard(sheetId, ranges, 1);
  const leaderboardClass2 = await getLeaderboard(sheetId, ranges, 2);
  const leaderboardClass3 = await getLeaderboard(sheetId, ranges, 3);
  const leaderboardClass4 = await getLeaderboard(sheetId, ranges, 4);
  const leaderboardClass5 = await getLeaderboard(sheetId, ranges, 5);

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
      <label className={styles.label}>
        <input
          type="radio"
          name="class"
          value="0"
          defaultChecked
          className={styles.input}
        />
        All Classes
      </label>
      <label className={styles.label}>
        <input type="radio" name="class" value="1" className={styles.input} />
        Class 1
      </label>
      <label className={styles.label}>
        <input type="radio" name="class" value="2" className={styles.input} />
        Class 2
      </label>
      <label className={styles.label}>
        <input type="radio" name="class" value="3" className={styles.input} />
        Class 3
      </label>
      <label className={styles.label}>
        <input type="radio" name="class" value="4" className={styles.input} />
        Class 4
      </label>
      <label className={styles.label}>
        <input type="radio" name="class" value="5" className={styles.input} />
        Class 5
      </label>
      <br />
      <label className={styles.label}>
        <input
          type="radio"
          name="context"
          value=""
          defaultChecked
          className={styles.input}
        />
        Overall
      </label>
      <label className={styles.label}>
        <input
          type="radio"
          name="context"
          value="sealed"
          className={styles.input}
        />
        Sealed
      </label>
      <label className={styles.label}>
        <input
          type="radio"
          name="context"
          value="unsealed"
          className={styles.input}
        />
        Unsealed
      </label>
      <div className={`${styles.class0} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, All Classes</h3>
          <Leaderboard leaderboard={leaderboard} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, All Classes</h3>
          <Leaderboard
            leaderboard={leaderboard}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, All Classes</h3>
          <Leaderboard
            leaderboard={leaderboard}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
      <div className={`${styles.class1} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, Class 1</h3>
          <Leaderboard leaderboard={leaderboardClass1} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, Class 1</h3>
          <Leaderboard
            leaderboard={leaderboardClass1}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, Class 1</h3>
          <Leaderboard
            leaderboard={leaderboardClass1}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
      <div className={`${styles.class2} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, Class 2</h3>
          <Leaderboard leaderboard={leaderboardClass2} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, Class 2</h3>
          <Leaderboard
            leaderboard={leaderboardClass2}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, Class 2</h3>
          <Leaderboard
            leaderboard={leaderboardClass2}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
      <div className={`${styles.class3} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, Class 3</h3>
          <Leaderboard leaderboard={leaderboardClass3} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, Class 3</h3>
          <Leaderboard
            leaderboard={leaderboardClass3}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, Class 3</h3>
          <Leaderboard
            leaderboard={leaderboardClass3}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
      <div className={`${styles.class4} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, Class 4</h3>
          <Leaderboard leaderboard={leaderboardClass4} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, Class 4</h3>
          <Leaderboard
            leaderboard={leaderboardClass4}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, Class 4</h3>
          <Leaderboard
            leaderboard={leaderboardClass4}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
      <div className={`${styles.class5} ${styles.classGroup}`}>
        <div className={styles.contextOverall}>
          <h3>Overall, Class 5</h3>
          <Leaderboard leaderboard={leaderboardClass5} ranges={ranges} />
        </div>
        <div className={styles.contextSealed}>
          <h3>Sealed, Class 5</h3>
          <Leaderboard
            leaderboard={leaderboardClass5}
            ranges={ranges}
            context="sealed"
          />
        </div>
        <div className={styles.contextUnsealed}>
          <h3>Unsealed, Class 5</h3>
          <Leaderboard
            leaderboard={leaderboardClass5}
            ranges={ranges}
            context="unsealed"
          />
        </div>
      </div>
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
