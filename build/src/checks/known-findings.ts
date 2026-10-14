// Spec checks that fail for a known reason, written up in plan/findings-for-research.md.
// Each records the value it failed with. The test suite passes while each still fails with that
// value, and fails if any of them changes, so new bugs aren't hidden by known failures.
// Remove entries once research has answered the questions in the findings note.

export interface KnownFinding {
  test: string;
  label: string;
  actual: number;
  reason: string;
}

const THETA = "θ = 200 is too small for the large-θ limits in step 2 (findings note, \"Why θ = 200 isn't large enough\")";
const ATTRACTION = `${THETA}; with minders' attraction to machines equal to X's (default 2)`;

export const KNOWN_FINDINGS: KnownFinding[] = [
  { test: "6 Augmenting, no premium", label: "η = 0.4: change in sector employment", actual: -0.38378, reason: THETA },
  { test: "6 Augmenting, no premium", label: "η = 0.4: change in sector output", actual: 0.016224, reason: THETA },
  { test: "6 Augmenting, no premium", label: "η = 2: price", actual: 0.52026, reason: THETA },
  { test: "6 Augmenting, no premium", label: "η = 2: matched workers' pay", actual: 1.0405, reason: THETA },
  { test: "6 Augmenting, no premium", label: "η = 2: change in sector employment", actual: 0.47738, reason: THETA },
  { test: "6 Augmenting, no premium", label: "θ check, η = 2: |change in employment at θ = 100 − at θ = 200|", actual: 0.073551, reason: THETA },
  { test: "6 Augmenting, no premium", label: "Boundary: scarce to in between, η", actual: 0.52, reason: `${THETA}; regime labels (default 6)` },
  { test: "8 Automating: hand-loom", label: "Price", actual: 0.36448, reason: ATTRACTION },
  { test: "8 Automating: hand-loom", label: "Incumbents' pay in the old technique", actual: 0.72895, reason: ATTRACTION },
  { test: "8 Automating: hand-loom", label: "Sector output relative to the base year", actual: 4.4719, reason: ATTRACTION },
  { test: "8 Automating: hand-loom", label: "θ check: |price at θ = 100 − price at θ = 200|, relative", actual: 0.027792, reason: ATTRACTION },
  { test: "9 Pure deskilling", label: "Incumbents' pay on the machines", actual: 0.97193, reason: ATTRACTION },
];

export function knownFinding(test: string, label: string): KnownFinding | undefined {
  return KNOWN_FINDINGS.find((k) => k.test === test && k.label === label);
}
