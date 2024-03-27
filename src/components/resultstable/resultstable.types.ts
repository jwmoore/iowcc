import type { EventResult } from "../../utils/sheets";

export type SortedEventResult = EventResult & {
  position: number;
  gap: number;
  gap1st: number;
};

export type ResultsTableProps = { data: EventResult[] };
