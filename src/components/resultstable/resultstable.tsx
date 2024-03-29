import type {
  ResultsTableProps,
  SortedEventResult,
} from "./resultstable.types";
import type { EventResult } from "../../utils/sheets";
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

function setPosition(data: EventResult[]) {
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
              <td>{isFinite(result.gap) ? result.gap : ""}</td>
              <td>{isFinite(result.gap1st) ? result.gap1st : ""}</td>
              <td>{Math.max(maxPoints - (result.position - 1), 1)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ResultsTable;
