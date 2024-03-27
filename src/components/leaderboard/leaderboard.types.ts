import type { DriverScore } from "../../utils/leaderboard";

export type LeaderboardProps = {
  ranges: string[];
  leaderboard: DriverScore[];
  context?: "sealed" | "unsealed";
};
