"use client";

import { useState } from "react";
import Leaderboard from "../leaderboard/leaderboard";
import type { LeaderboardRow } from "../../utils/leaderboard";
import styles from "./leaderboard-filters.module.css";

type Props = {
  ranges: string[];
  leaderboards: LeaderboardRow[][];
};

const classOptions = [
  { value: 0, label: "All Classes" },
  { value: 1, label: "Class 1" },
  { value: 2, label: "Class 2" },
  { value: 3, label: "Class 3" },
  { value: 4, label: "Class 4" },
  { value: 5, label: "Class 5" },
  { value: 6, label: "Class 6" },
];

const contextOptions: { value: "" | "sealed" | "unsealed"; label: string }[] = [
  { value: "", label: "Overall" },
  { value: "sealed", label: "Sealed" },
  { value: "unsealed", label: "Unsealed" },
];

export default function LeaderboardFilters({ ranges, leaderboards }: Props) {
  const [selectedClass, setSelectedClass] = useState(0);
  const [selectedContext, setSelectedContext] = useState<
    "" | "sealed" | "unsealed"
  >("");

  const classLabel =
    selectedClass === 0 ? "All Classes" : `Class ${selectedClass}`;
  const contextLabel =
    contextOptions.find((o) => o.value === selectedContext)?.label ?? "Overall";

  return (
    <>
      <label className={styles.label}>
        Class:
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(Number(e.target.value))}
          className={styles.select}
        >
          {classOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        Championship:
        <select
          value={selectedContext}
          onChange={(e) =>
            setSelectedContext(e.target.value as "" | "sealed" | "unsealed")
          }
          className={styles.select}
        >
          {contextOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <h3>
        {contextLabel}, {classLabel}
      </h3>
      <Leaderboard
        leaderboard={leaderboards[selectedClass]}
        ranges={ranges}
        context={selectedContext || undefined}
      />
    </>
  );
}
