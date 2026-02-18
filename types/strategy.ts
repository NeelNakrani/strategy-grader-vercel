// ─── Form Input ───────────────────────────────────────────────────────────────

export type Timeframe =
  | "scalp"
  | "intraday"
  | "swing"
  | "position";

export type StrategyInput = {
  // Identification
  strategyName: string;
  assetClass: string;
  timeframe: Timeframe;

  // Core numbers
  stopPercent: number;        // % stop loss distance
  targetPercent: number;      // % take profit distance
  riskPerTradePercent: number; // % of account risked per trade
  tradesPerWeek: number;

  // Optional — if omitted engine uses 45% conservative default
  winRatePercent?: number;
};

// ─── Scoring Sub-Results ─────────────────────────────────────────────────────

export type RRResult = {
  rr: number;
  score: number;        // 0–100
  label: "Fail" | "Weak" | "Acceptable" | "Strong";
  note: string;
};

export type WinRateResult = {
  requiredWinRate: number;    // % needed to break even
  providedWinRate: number;    // actual (or assumed 45%)
  isAssumed: boolean;
  score: number;
  note: string;
};

export type ExpectancyResult = {
  expectancy: number;         // $ per $1 risked
  score: number;
  label: "Negative" | "Marginal" | "Positive" | "Strong";
  note: string;
};

export type RiskPerTradeResult = {
  riskPercent: number;
  score: number;
  severity: "OK" | "Warning" | "Critical";
  note: string;
};

export type VolatilityResult = {
  stopPercent: number;
  adrTypical: number;
  ratio: number;              // stop / adrTypical
  score: number;
  label: "Too Tight" | "Acceptable" | "Wide";
  note: string;
};

// ─── Final Report ─────────────────────────────────────────────────────────────

export type GradeLetter = "A" | "B" | "C" | "D" | "F";

export type StrategyReport = {
  // Input echo
  input: StrategyInput;

  // Sub-scores
  rrResult: RRResult;
  winRateResult: WinRateResult;
  expectancyResult: ExpectancyResult;
  riskPerTradeResult: RiskPerTradeResult;
  volatilityResult: VolatilityResult;

  // Final
  finalScore: number;         // 0–100 weighted
  grade: GradeLetter;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];

  // Meta
  analyzedAt: string;         // ISO timestamp
  sessionId: string;          // anonymous session UUID
};
