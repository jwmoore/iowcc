import Link from "next/link";
import { getSheetNames } from "../utils/sheets";

export default async function Home() {
  const seasons = await getSheetNames();

  return (
    <>
      <h1>IOWCC Autotest Championship Results</h1>

      <p>Choose a season:</p>
      <ul>
        {seasons.map((season, index) => {
          return (
            <li key={index}>
              <Link href={`/${season}`}>{season}</Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
