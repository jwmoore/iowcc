import type { ResultsTableProps } from "./resultstable.types";
import { setPosition } from "../../utils/leaderboard";
import styles from "./resultstable.module.css";

const maxPoints = 50;

function resultClass(result: string) {
  if (!result || result.toUpperCase() === "X") {
    return styles.blank;
  }

  if (result.toUpperCase() === "WT" || result.toUpperCase() === "DNF") {
    return styles.wt;
  }

  if (result.endsWith("*")) {
    return styles.bold;
  }
}

const ResultsTable = ({ data }: ResultsTableProps): JSX.Element => {
  const tableData = setPosition(data);

  if (!tableData.length) {
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
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((result, index) => {
          return (
            <tr key={index}>
              <td>{result.position}</td>
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
              <td>{index > 0 && isFinite(result.gap) ? result.gap : ""}</td>
              <td>
                {index > 0 && isFinite(result.gap1st) ? result.gap1st : ""}
              </td>
              <td>
                {isFinite(result.best)
                  ? Math.max(maxPoints - (result.position - 1), 1)
                  : ""}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ResultsTable;
