"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StrategyReport, GradeLetter } from "@/types/strategy";
import { ASSET_CLASS_MAP } from "@/config/assetClasses";

const GRADE_CONFIG: Record<GradeLetter, { color: string; bg: string; border: string; label: string }> = {
  A: { color: "#3fb950", bg: "#0d2016", border: "#3fb950", label: "Excellent" },
  B: { color: "#58a6ff", bg: "#0c1a2e", border: "#58a6ff", label: "Good" },
  C: { color: "#d29922", bg: "#1a1500", border: "#d29922", label: "Mediocre" },
  D: { color: "#f0883e", bg: "#1a0f00", border: "#f0883e", label: "Poor" },
  F: { color: "#f85149", bg: "#1a0505", border: "#f85149", label: "Failing" },
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-[#21262d] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SubScoreCard({
  label,
  score,
  detail,
  note,
  badge,
  badgeColor,
}: {
  label: string;
  score: number;
  detail: string;
  note: string;
  badge: string;
  badgeColor: string;
}) {
  const color =
    score >= 75 ? "#3fb950" : score >= 50 ? "#d29922" : "#f85149";

  return (
    <div className="border border-[#21262d] rounded-lg bg-[#0d1117] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-[#484f58] uppercase tracking-widest mb-1">{label}</div>
          <div className="text-xl font-semibold text-[#e6edf3]">{detail}</div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded border font-medium"
          style={{ color: badgeColor, borderColor: badgeColor, backgroundColor: `${badgeColor}15` }}
        >
          {badge}
        </span>
      </div>
      <ScoreBar score={score} color={color} />
      <div className="flex justify-between items-center mt-1 mb-3">
        <span className="text-xs text-[#484f58]">Score</span>
        <span className="text-xs font-mono" style={{ color }}>{score}/100</span>
      </div>
      <p className="text-xs text-[#8b949e] leading-relaxed">{note}</p>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<StrategyReport | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sg_report");
    if (!stored) {
      router.push("/");
      return;
    }
    setReport(JSON.parse(stored));
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#010409] flex items-center justify-center">
        <div className="text-[#484f58] text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Loading report...</div>
      </div>
    );
  }

  const gradeConfig = GRADE_CONFIG[report.grade];
  const asset = ASSET_CLASS_MAP[report.input.assetClass];
  const analyzedDate = new Date(report.analyzedAt).toLocaleString();

  return (
    <main
      className="min-h-screen bg-[#010409] text-[#e6edf3]"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            New Analysis
          </button>
        </div>
        <button
          onClick={() => window.print()}
          className="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Report Header */}
        <div className="mb-8">
          <div className="text-xs text-[#484f58] mb-1">{analyzedDate}</div>
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-1">{report.input.strategyName}</h1>
          <div className="flex flex-wrap gap-3 text-xs text-[#8b949e]">
            <span>{asset?.label ?? report.input.assetClass}</span>
            <span className="text-[#30363d]">·</span>
            <span className="capitalize">{report.input.timeframe}</span>
            <span className="text-[#30363d]">·</span>
            <span>{report.input.tradesPerWeek} trades/week</span>
          </div>
        </div>

        {/* Grade Card */}
        <div
          className="border rounded-lg p-6 mb-8 flex items-center justify-between"
          style={{
            borderColor: gradeConfig.border,
            backgroundColor: gradeConfig.bg,
          }}
        >
          <div>
            <div className="text-xs tracking-widest uppercase mb-2" style={{ color: gradeConfig.color }}>
              Overall Strategy Grade
            </div>
            <div className="flex items-baseline gap-4">
              <span
                className="text-7xl font-bold"
                style={{ color: gradeConfig.color }}
              >
                {report.grade}
              </span>
              <div>
                <div className="text-lg font-semibold text-[#e6edf3]">{gradeConfig.label}</div>
                <div className="text-sm text-[#8b949e]">Score: {report.finalScore}/100</div>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#21262d" strokeWidth="2.5"/>
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={gradeConfig.color}
                  strokeWidth="2.5"
                  strokeDasharray={`${report.finalScore} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center text-sm font-mono"
                style={{ color: gradeConfig.color }}
              >
                {report.finalScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Scores Grid */}
        <div className="text-xs text-[#484f58] tracking-widest uppercase mb-4">Score Breakdown</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <SubScoreCard
            label="Risk / Reward"
            score={report.rrResult.score}
            detail={`${report.rrResult.rr.toFixed(2)}:1 R:R`}
            note={report.rrResult.note}
            badge={report.rrResult.label}
            badgeColor={report.rrResult.score >= 75 ? "#3fb950" : report.rrResult.score >= 45 ? "#d29922" : "#f85149"}
          />
          <SubScoreCard
            label="Win Rate Analysis"
            score={report.winRateResult.score}
            detail={`${report.winRateResult.providedWinRate}% WR`}
            note={report.winRateResult.note}
            badge={report.winRateResult.isAssumed ? "Assumed" : "Provided"}
            badgeColor={report.winRateResult.isAssumed ? "#d29922" : "#58a6ff"}
          />
          <SubScoreCard
            label="Expectancy"
            score={report.expectancyResult.score}
            detail={`${report.expectancyResult.expectancy >= 0 ? "+" : ""}${report.expectancyResult.expectancy.toFixed(3)}R`}
            note={report.expectancyResult.note}
            badge={report.expectancyResult.label}
            badgeColor={report.expectancyResult.score >= 70 ? "#3fb950" : report.expectancyResult.score >= 40 ? "#d29922" : "#f85149"}
          />
          <SubScoreCard
            label="Risk Per Trade"
            score={report.riskPerTradeResult.score}
            detail={`${report.riskPerTradeResult.riskPercent}% per trade`}
            note={report.riskPerTradeResult.note}
            badge={report.riskPerTradeResult.severity}
            badgeColor={report.riskPerTradeResult.severity === "OK" ? "#3fb950" : report.riskPerTradeResult.severity === "Warning" ? "#f0883e" : "#f85149"}
          />
          <SubScoreCard
            label="Volatility Fit"
            score={report.volatilityResult.score}
            detail={`${report.volatilityResult.ratio.toFixed(2)}× ADR`}
            note={report.volatilityResult.note}
            badge={report.volatilityResult.label}
            badgeColor={report.volatilityResult.label === "Acceptable" ? "#3fb950" : report.volatilityResult.label === "Too Tight" ? "#f85149" : "#f0883e"}
          />
        </div>

        {/* Narrative Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="border border-[#21262d] rounded-lg bg-[#0d1117] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
                <div className="text-xs text-[#3fb950] tracking-widest uppercase">Strengths</div>
              </div>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[#8b949e] leading-relaxed flex gap-2">
                    <span className="text-[#3fb950] mt-0.5 flex-shrink-0">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {report.weaknesses.length > 0 && (
            <div className="border border-[#21262d] rounded-lg bg-[#0d1117] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#f85149]" />
                <div className="text-xs text-[#f85149] tracking-widest uppercase">Weaknesses</div>
              </div>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-[#8b949e] leading-relaxed flex gap-2">
                    <span className="text-[#f85149] mt-0.5 flex-shrink-0">−</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          <div className="border border-[#21262d] rounded-lg bg-[#0d1117] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
              <div className="text-xs text-[#58a6ff] tracking-widest uppercase">Improvements</div>
            </div>
            <ul className="space-y-2">
              {report.improvements.map((imp, i) => (
                <li key={i} className="text-xs text-[#8b949e] leading-relaxed flex gap-2">
                  <span className="text-[#58a6ff] mt-0.5 flex-shrink-0">→</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Input Echo */}
        <div className="border border-[#21262d] rounded-lg bg-[#0d1117] p-5 mb-8">
          <div className="text-xs text-[#484f58] tracking-widest uppercase mb-4">Input Parameters</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Stop %", value: `${report.input.stopPercent}%` },
              { label: "Target %", value: `${report.input.targetPercent}%` },
              { label: "Risk/Trade", value: `${report.input.riskPerTradePercent}%` },
              { label: "Trades/wk", value: report.input.tradesPerWeek },
              { label: "Break-even WR", value: `${report.winRateResult.requiredWinRate.toFixed(1)}%` },
              { label: "Actual WR", value: `${report.winRateResult.providedWinRate}%${report.winRateResult.isAssumed ? " *" : ""}` },
              { label: "Typical ADR", value: `${report.volatilityResult.adrTypical}%` },
              { label: "Expectancy", value: `${report.expectancyResult.expectancy.toFixed(3)}R` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-[#484f58] mb-0.5">{label}</div>
                <div className="text-sm text-[#e6edf3] font-mono">{value}</div>
              </div>
            ))}
          </div>
          {report.winRateResult.isAssumed && (
            <p className="text-xs text-[#484f58] mt-3">* Win rate was not provided — 45% conservative assumption used.</p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-[#58a6ff] hover:bg-[#79b8ff] text-[#010409] font-semibold text-sm rounded transition-colors"
          >
            Analyze Another Strategy
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 border border-[#30363d] hover:border-[#58a6ff] text-[#8b949e] hover:text-[#e6edf3] text-sm rounded transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[#484f58] text-xs leading-relaxed border-t border-[#21262d] pt-6">
          StrategyGrader provides mathematical analysis for educational purposes only. 
          This report is not financial advice and does not guarantee any trading outcome. 
          Strategy structure does not account for market conditions, execution quality, or 
          psychological factors. Always consult a licensed financial advisor.
        </p>
      </div>
    </main>
  );
}
