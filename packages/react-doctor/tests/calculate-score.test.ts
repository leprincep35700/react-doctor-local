import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { calculateScoreLocally } from "../src/utils/calculate-score-locally.js";
import { calculateScore } from "../src/utils/calculate-score.js";
import type { Diagnostic } from "../src/types.js";

const sampleDiagnostics: Diagnostic[] = [
  {
    filePath: "src/App.tsx",
    plugin: "react-doctor",
    rule: "example-rule",
    severity: "error",
    message: "Example",
    help: "",
    line: 1,
    column: 1,
    category: "performance",
  },
];

describe("score calculation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("calculateScore", () => {
    it("always returns the local score", async () => {
      const expected = calculateScoreLocally(sampleDiagnostics);
      const score = await calculateScore(sampleDiagnostics);

      expect(score).toEqual(expected);
    });

    it("never calls fetch while calculating the score", async () => {
      const fetchSpy = vi.fn(async () => {
        throw new Error("network must not be used");
      });
      vi.stubGlobal("fetch", fetchSpy);

      await calculateScore(sampleDiagnostics);

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
