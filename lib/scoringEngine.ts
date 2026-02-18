import { ASSET_CLASS_MAP } from "@/config/assetClasses";
import type {
  StrategyInput,
  StrategyReport,
  RRResult,
  WinRateResult,
  ExpectancyResult,
  RiskPerTradeResult,
  VolatilityResult,
  GradeLetter,
} from "@/types/strategy";
import { v4 as uuidv4 } from "uuid";

// ─── Weights (from design doc) ────────────────────────────────────────────────
const WEIGHTS = {
  rr: 0.30,
  riskPerTrade: 0.25,
  expectancy: 0.25,
  volatility: 0.20,
};

// ─── A. Risk-to-Reward ────────────────────────────────────────────────────────
function scoreRR(stop: number, target: number): RRResult {
  const rr = target / stop;

  let score: number;
  let label: RRResult["label"];
  let note: string;

  if (rr < 1) {
    score = 0;
    label = "Fail";
    note = `Your R:R of ${rr.toFixed(2)} means you risk more than you stand to gain. Every losing trade costs more than every winning trade earns.`;
  } else if (rr < 1.5) {
    score = 35;
    label = "Weak";
    note = `R:R of ${rr.toFixed(2)} is technically positive but leaves little room for error. You need a high win rate to stay profitable.`;
  } else if (rr < 2) {
    score = 68;
    label = "Acceptable";
    note = `R:R of ${rr.toFixed(2)} is workable. You can be profitable with a moderate win rate (~40%+).`;
  } else {
    score = 95;
    label = "Strong";
    note = `R:R of ${rr.toFixed(2)} is strong. Even a win rate below 40% can produce consistent profits at this ratio.`;
  }

  return { rr, score, label, note };
}

// ─── B. Required Win Rate ─────────────────────────────────────────────────────
function scoreWinRate(
  rr: number,
  providedWinRatePercent?: number
): WinRateResult {
  const requiredWinRate = (1 / (1 + rr)) * 100;
  const isAssumed = providedWinRatePercent === undefined;
  const providedWinRate = isAssumed ? 45 : providedWinRatePercent!;

  // Score based on buffer between provided win rate and required win rate
  const buffer = providedWinRate - requiredWinRate;

  let score: number;
  let note: string;

  if (buffer < -10) {
    score = 10;
    note = `Your win rate${isAssumed ? " (assumed 45%)" : ""} of ${providedWinRate}% is well below the ${requiredWinRate.toFixed(1)}% needed to break even. This strategy loses money over time.`;
  } else if (buffer < 0) {
    score = 30;
    note = `Your win rate${isAssumed ? " (assumed 45%)" : ""} of ${providedWinRate}% is below the ${requiredWinRate.toFixed(1)}% break-even threshold. Marginal viability.`;
  } else if (buffer < 10) {
    score = 60;
    note = `Win rate of ${providedWinRate}% is above break-even (${requiredWinRate.toFixed(1)}%) but the margin is thin. Small variance can push you negative.`;
  } else {
    score = 90;
    note = `Win rate of ${providedWinRate}% gives a healthy ${buffer.toFixed(1)}% buffer above the ${requiredWinRate.toFixed(1)}% break-even rate. Good cushion.`;
  }

  if (isAssumed) {
    note = "[Conservative 45% win rate assumed] " + note;
  }

  return { requiredWinRate, providedWinRate, isAssumed, score, note };
}

// ─── C. Expectancy ────────────────────────────────────────────────────────────
function scoreExpectancy(
  rr: number,
  providedWinRatePercent?: number
): ExpectancyResult {
  const winRate = (providedWinRatePercent ?? 45) / 100;
  const lossRate = 1 - winRate;

  // Normalised: avg win = rr × 1 unit, avg loss = 1 unit
  const expectancy = winRate * rr - lossRate * 1;

  let score: number;
  let label: ExpectancyResult["label"];
  let note: string;

  if (expectancy < 0) {
    score = 0;
    label = "Negative";
    note = `Expectancy of ${expectancy.toFixed(3)}R is negative. Running this strategy long-term guarantees losses regardless of execution quality.`;
  } else if (expectancy < 0.2) {
    score = 45;
    label = "Marginal";
    note = `Expectancy of ${expectancy.toFixed(3)}R per trade is marginal. Commissions and slippage could easily push this negative.`;
  } else if (expectancy < 0.5) {
    score = 72;
    label = "Positive";
    note = `Expectancy of ${expectancy.toFixed(3)}R per trade is solid. Each trade has a positive expected value.`;
  } else {
    score = 95;
    label = "Strong";
    note = `Expectancy of ${expectancy.toFixed(3)}R per trade is excellent. This strategy generates strong edge per trade taken.`;
  }

  return { expectancy, score, label, note };
}

// ─── D. Risk Per Trade ────────────────────────────────────────────────────────
function scoreRiskPerTrade(riskPercent: number): RiskPerTradeResult {
  let score: number;
  let severity: RiskPerTradeResult["severity"];
  let note: string;

  if (riskPercent <= 1) {
    score = 95;
    severity = "OK";
    note = `${riskPercent}% risk per trade is conservative and professional. Account can sustain extended drawdowns without critical damage.`;
  } else if (riskPercent <= 2) {
    score = 75;
    severity = "OK";
    note = `${riskPercent}% risk per trade is within acceptable range. A 10-loss streak would draw your account down ~20%. Manageable.`;
  } else if (riskPercent <= 3) {
    score = 50;
    severity = "Warning";
    note = `${riskPercent}% risk per trade is elevated. A 10-loss streak costs ~30% of account. Consider reducing to 2% or below.`;
  } else if (riskPercent <= 5) {
    score = 20;
    severity = "Warning";
    note = `${riskPercent}% risk per trade is high. A 10-loss streak could destroy ~40% of your account. This will fail prop firm risk limits.`;
  } else {
    score = 0;
    severity = "Critical";
    note = `${riskPercent}% risk per trade is critical. A single bad week could wipe your account. This is gambling, not trading.`;
  }

  return { riskPercent, score, severity, note };
}

// ─── E. Volatility Fit ────────────────────────────────────────────────────────
function scoreVolatility(
  stopPercent: number,
  assetClassId: string
): VolatilityResult {
  const asset = ASSET_CLASS_MAP[assetClassId];
  const adrTypical = asset?.adrTypical ?? 2.0;
  const ratio = stopPercent / adrTypical;

  let score: number;
  let label: VolatilityResult["label"];
  let note: string;

  if (ratio < 0.5) {
    score = 20;
    label = "Too Tight";
    note = `Stop of ${stopPercent}% is less than half the typical daily range (${adrTypical}%) for ${asset?.label ?? "this asset class"}. Normal price noise will stop you out constantly before the trade can develop.`;
  } else if (ratio <= 1.5) {
    score = 85;
    label = "Acceptable";
    note = `Stop of ${stopPercent}% fits well within the typical daily range (${adrTypical}%) for ${asset?.label ?? "this asset class"}. Gives the trade room to breathe.`;
  } else {
    score = 55;
    label = "Wide";
    note = `Stop of ${stopPercent}% is significantly wider than the typical daily range (${adrTypical}%) for ${asset?.label ?? "this asset class"}. Either your position size must be smaller, or reconsider stop placement.`;
  }

  return { stopPercent, adrTypical, ratio, score, label, note };
}

// ─── Final Grade ──────────────────────────────────────────────────────────────
function computeGrade(score: number): GradeLetter {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

// ─── Narrative Generation ─────────────────────────────────────────────────────
function generateNarrative(
  rr: RRResult,
  wr: WinRateResult,
  exp: ExpectancyResult,
  risk: RiskPerTradeResult,
  vol: VolatilityResult
) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  // Strengths
  if (rr.label === "Strong") strengths.push("Excellent risk-to-reward ratio — high R:R is the foundation of professional trading.");
  if (rr.label === "Acceptable") strengths.push("Acceptable risk-to-reward ratio that gives a viable edge with consistent execution.");
  if (exp.label === "Strong" || exp.label === "Positive") strengths.push("Positive mathematical expectancy — this strategy has real statistical edge.");
  if (risk.severity === "OK" && risk.riskPercent <= 1) strengths.push("Conservative position sizing — your account is well-protected from drawdown sequences.");
  if (risk.severity === "OK") strengths.push("Risk per trade is within professional standards.");
  if (vol.label === "Acceptable") strengths.push("Stop placement respects the natural volatility of your chosen market.");
  if (wr.providedWinRate - wr.requiredWinRate > 10) strengths.push("Win rate provides a healthy buffer above the break-even threshold.");

  // Weaknesses
  if (rr.label === "Fail") weaknesses.push("Risk-to-reward ratio is below 1:1 — you cannot profit long-term from this setup.");
  if (rr.label === "Weak") weaknesses.push("R:R ratio is too low to survive realistic drawdown periods.");
  if (exp.label === "Negative") weaknesses.push("Negative expectancy means each trade loses money on average — no execution quality fixes this.");
  if (exp.label === "Marginal") weaknesses.push("Marginal expectancy leaves no margin for commissions, slippage, or execution error.");
  if (risk.severity === "Warning") weaknesses.push("Risk per trade is too high — extended losing streaks will cause serious account damage.");
  if (risk.severity === "Critical") weaknesses.push("Critical risk per trade — one bad week can wipe the account.");
  if (vol.label === "Too Tight") weaknesses.push("Stop loss is too tight for the asset's natural daily movement — high false stop-out rate expected.");
  if (wr.providedWinRate < wr.requiredWinRate) weaknesses.push("Win rate is below break-even — this strategy loses money over time.");

  // Improvements
  if (rr.rr < 2) improvements.push(`Increase your target to achieve at least 2:1 R:R. Current R:R is ${rr.rr.toFixed(2)}. Try widening target or tightening stop.`);
  if (risk.riskPercent > 2) improvements.push("Reduce risk per trade to 1–2%. The quality of a strategy means nothing if position sizing blows the account.");
  if (vol.label === "Too Tight") improvements.push(`Widen your stop to at least ${(vol.adrTypical * 0.5).toFixed(1)}% to give trades room beyond normal daily noise.`);
  if (wr.isAssumed) improvements.push("Track and record your actual win rate. The 45% assumption may not reflect your real edge.");
  if (exp.label === "Negative" || exp.label === "Marginal") improvements.push("Reconsider entry criteria to improve your win rate, or improve your R:R to compensate for lower win rate.");
  if (improvements.length === 0) improvements.push("Strategy shows good structure. Focus on strict mechanical execution and journaling every trade.");

  return { strengths, weaknesses, improvements };
}

// ─── Main Engine ──────────────────────────────────────────────────────────────
export function analyzeStrategy(
  input: StrategyInput,
  sessionId?: string
): StrategyReport {
  const rrResult = scoreRR(input.stopPercent, input.targetPercent);
  const winRateResult = scoreWinRate(rrResult.rr, input.winRatePercent);
  const expectancyResult = scoreExpectancy(rrResult.rr, input.winRatePercent);
  const riskPerTradeResult = scoreRiskPerTrade(input.riskPerTradePercent);
  const volatilityResult = scoreVolatility(input.stopPercent, input.assetClass);

  // Win rate is factored INTO expectancy (they're mathematically linked).
  // We average the two expectancy-related scores so they represent one 25% bucket.
  const expectancyBucket = Math.round((winRateResult.score + expectancyResult.score) / 2);

  const finalScore = Math.min(100, Math.round(
    rrResult.score * WEIGHTS.rr +
    riskPerTradeResult.score * WEIGHTS.riskPerTrade +
    expectancyBucket * WEIGHTS.expectancy +
    volatilityResult.score * WEIGHTS.volatility
  ));

  const grade = computeGrade(finalScore);
  const { strengths, weaknesses, improvements } = generateNarrative(
    rrResult,
    winRateResult,
    expectancyResult,
    riskPerTradeResult,
    volatilityResult
  );

  return {
    input,
    rrResult,
    winRateResult,
    expectancyResult,
    riskPerTradeResult,
    volatilityResult,
    finalScore,
    grade,
    strengths,
    weaknesses,
    improvements,
    analyzedAt: new Date().toISOString(),
    sessionId: sessionId ?? uuidv4(),
  };
}
