import Link from "next/link";
import { getSheetId, getRanges, rangeToSlug } from "../../utils/sheets";
import { getLeaderboard, getRegisteredDrivers, isEventSheetTitle } from "../../utils/leaderboard";
import Header from "../../components/header/header";
import LeaderboardFilters from "../../components/leaderboard-filters/leaderboard-filters";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{
    season: string;
  }>;
};

export default async function Page(props: PageParams) {
  const params = await props.params;
  const sheetId = await getSheetId(params.season);

  if (!sheetId) {
    return notFound();
  }

  const ranges = await getRanges(sheetId);
  const drivers = await getRegisteredDrivers(sheetId, ranges);
  const leaderboard = await getLeaderboard(sheetId, ranges);
  const leaderboardClass1 = await getLeaderboard(sheetId, ranges, 1);
  const leaderboardClass2 = await getLeaderboard(sheetId, ranges, 2);
  const leaderboardClass3 = await getLeaderboard(sheetId, ranges, 3);
  const leaderboardClass4 = await getLeaderboard(sheetId, ranges, 4);
  const leaderboardClass5 = await getLeaderboard(sheetId, ranges, 5);
  const leaderboardClass6 = await getLeaderboard(sheetId, ranges, 6);

  return (
    <>
      <Header heading={`${params.season} Season`} />
      <p>
        <Link href="/">&larr; Back to Home</Link>
      </p>
      <h2>Event Results</h2>
      <ul>
        {ranges.map((range, index) => {
          if (!isEventSheetTitle(range)) {
            return null;
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
      <LeaderboardFilters
        ranges={ranges}
        leaderboards={[
          leaderboard,
          leaderboardClass1,
          leaderboardClass2,
          leaderboardClass3,
          leaderboardClass4,
          leaderboardClass5,
          leaderboardClass6,
        ]}
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
          {drivers.map((driver) => (
            <tr key={driver.number}>
              <td>{driver.number}</td>
              <td>{driver.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
