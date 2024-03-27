import Header from "../components/header/header";
import Link from "next/link";
import { getSheetNames } from "../utils/sheets";

export default async function Home() {
  const seasons = await getSheetNames();

  return (
    <>
      <Header heading="IOWCC Autotest Championship Results" />

      <p>Choose a season:</p>
      <ul>
        {seasons
          .sort()
          .reverse()
          .map((season, index) => {
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
