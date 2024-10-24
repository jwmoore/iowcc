import type { LeaderboardRow } from "../../utils/leaderboard";

export type LeaderboardProps = {
  ranges: string[];
  leaderboard: LeaderboardRow[];
  context?: "sealed" | "unsealed";
};
