import type { Diagnostic, ScoreResult } from "../types.js";
import { calculateScoreLocally } from "./calculate-score-locally.js";

export { calculateScoreLocally } from "./calculate-score-locally.js";

export const calculateScore = async (diagnostics: Diagnostic[]): Promise<ScoreResult | null> =>
  calculateScoreLocally(diagnostics);
