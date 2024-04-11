import Link from "next/link";
import React from "react";
import {
  getSheetId,
  getRanges,
  rangeToSlug,
  getEventResults,
} from "../../../utils/sheets";
import Header from "../../../components/header/header";
import ResultsTable from "../../../components/resultstable/resultstable";
import { notFound } from "next/navigation";

type PageParams = {
  params: {
    season: string;
    event: string;
  };
};

export default async function Page({ params }: PageParams) {
  const sheetId = await getSheetId(params.season);

  if (!sheetId) {
    return notFound();
  }

  const ranges = await getRanges(sheetId);
  const range = ranges.filter((item) => params.event === rangeToSlug(item))[0];

  if (!range) {
    throw new Error("Failed to fetch data");
  }

  let overallData = await getEventResults(sheetId, range);

  return (
    <>
      <Header heading={`Results: ${range}`} />

      <p>
        <Link href={`/${params.season}`}>
          &larr; Back to {params.season} Season
        </Link>
      </p>

      <h2>Overall</h2>
      <ResultsTable data={overallData} />

      <h2>By Class</h2>
      <h3>Class 1</h3>
      <ResultsTable
        data={overallData.filter((result) => result.class === "1")}
      />
      <h3>Class 2</h3>
      <ResultsTable
        data={overallData.filter((result) => result.class === "2")}
      />
      <h3>Class 3</h3>
      <ResultsTable
        data={overallData.filter((result) => result.class === "3")}
      />
      <h3>Class 4</h3>
      <ResultsTable
        data={overallData.filter((result) => result.class === "4")}
      />
      <h3>Class 5</h3>
      <ResultsTable
        data={overallData.filter((result) => result.class === "5")}
      />
    </>
  );
}
