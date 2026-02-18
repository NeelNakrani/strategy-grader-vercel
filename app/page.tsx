"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { ASSET_CLASSES } from "@/config/assetClasses";

type FormData = {
  strategyName: string;
  assetClass: string;
  timeframe: string;
  stopPercent: string;
  targetPercent: string;
  riskPerTradePercent: string;
  tradesPerWeek: string;
  winRatePercent: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const TIMEFRAMES = [
  { id: "scalp", label: "Scalping (< 15 min)" },
  { id: "intraday", label: "Intraday (15 min – EOD)" },
  { id: "swing", label: "Swing (2–10 days)" },
  { id: "position", label: "Position (weeks+)" },
];

export default function HomePage() {
  const router = useRouter();
  const formId = useId();

  const [form, setForm] = useState<FormData>({
    strategyName: "",
    assetClass: "",
    timeframe: "",
    stopPercent: "",
    targetPercent: "",
    riskPerTradePercent: "",
    tradesPerWeek: "",
    winRatePercent: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: FieldErrors = {};

    if (!form.strategyName.trim()) newErrors.strategyName = "Required";
    if (!form.assetClass) newErrors.assetClass = "Select an asset class";
    if (!form.timeframe) newErrors.timeframe = "Select a timeframe";

    const stop = parseFloat(form.stopPercent);
    if (!form.stopPercent || isNaN(stop) || stop <= 0) {
      newErrors.stopPercent = "Enter a valid positive number";
    }

    const target = parseFloat(form.targetPercent);
    if (!form.targetPercent || isNaN(target) || target <= 0) {
      newErrors.targetPercent = "Enter a valid positive number";
    }

    const risk = parseFloat(form.riskPerTradePercent);
    if (!form.riskPerTradePercent || isNaN(risk) || risk <= 0) {
      newErrors.riskPerTradePercent = "Enter a valid positive number";
    }

    const trades = parseFloat(form.tradesPerWeek);
    if (!form.tradesPerWeek || isNaN(trades) || trades <= 0) {
      newErrors.tradesPerWeek = "Enter a valid number";
    }

    if (form.winRatePercent) {
      const wr = parseFloat(form.winRatePercent);
      if (isNaN(wr) || wr < 1 || wr > 99) {
        newErrors.winRatePercent = "Must be between 1 and 99";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        strategyName: form.strategyName.trim(),
        assetClass: form.assetClass,
        timeframe: form.timeframe,
        stopPercent: parseFloat(form.stopPercent),
        targetPercent: parseFloat(form.targetPercent),
        riskPerTradePercent: parseFloat(form.riskPerTradePercent),
        tradesPerWeek: parseFloat(form.tradesPerWeek),
        ...(form.winRatePercent
          ? { winRatePercent: parseFloat(form.winRatePercent) }
          : {}),
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const report = await res.json();
      // Store report in sessionStorage for the report page
      sessionStorage.setItem("sg_report", JSON.stringify(report));
      router.push("/report");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function setField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-[#0d1117] border rounded px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? "border-[#f85149] focus:ring-[#f85149] focus:border-[#f85149]"
        : "border-[#30363d] focus:ring-[#58a6ff] focus:border-[#58a6ff]"
    }`;

  const selectClass = (field: keyof FormData) =>
    `w-full bg-[#0d1117] border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors appearance-none ${
      errors[field]
        ? "border-[#f85149] focus:ring-[#f85149] focus:border-[#f85149] text-[#e6edf3]"
        : form[field]
        ? "border-[#30363d] focus:ring-[#58a6ff] focus:border-[#58a6ff] text-[#e6edf3]"
        : "border-[#30363d] focus:ring-[#58a6ff] focus:border-[#58a6ff] text-[#484f58]"
    }`;

  return (
    <main className="min-h-screen bg-[#010409] text-[#e6edf3]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M3 17l4-8 4 4 4-6 4 10" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 21h18" stroke="#30363d" strokeWidth="1"/>
            </svg>
          </div>
          <span className="text-[#58a6ff] font-medium tracking-tight">StrategyGrader</span>
          <span className="text-[#484f58] text-xs">v1.0 MVP</span>
        </div>
        <div className="text-[#484f58] text-xs hidden sm:block">
          Not financial advice — educational analysis only
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className="text-xs text-[#58a6ff] tracking-widest uppercase mb-3">Strategy Analysis Engine</div>
          <h1 className="text-3xl font-semibold text-[#e6edf3] leading-tight mb-3">
            Is your strategy structurally sound<br />
            <span className="text-[#484f58]">— or are you just gambling?</span>
          </h1>
          <p className="text-[#8b949e] text-sm leading-relaxed">
            Enter your strategy parameters. The engine evaluates your risk/reward, 
            expectancy, position sizing, and volatility fit — then gives you a structured 
            grade with specific improvement points.
          </p>
        </div>

        {/* Form */}
        <div className="border border-[#21262d] rounded-lg bg-[#0d1117] divide-y divide-[#21262d]">
          
          {/* Section: Identity */}
          <div className="px-6 py-5">
            <div className="text-xs text-[#484f58] tracking-widest uppercase mb-4">01 — Strategy Identity</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-name`}>
                  Strategy Name
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  placeholder="e.g. Opening Range Breakout"
                  className={inputClass("strategyName")}
                  value={form.strategyName}
                  onChange={(e) => setField("strategyName", e.target.value)}
                />
                {errors.strategyName && <p className="text-[#f85149] text-xs mt-1">{errors.strategyName}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-asset`}>
                  Asset Class
                </label>
                <div className="relative">
                  <select
                    id={`${formId}-asset`}
                    className={selectClass("assetClass")}
                    value={form.assetClass}
                    onChange={(e) => setField("assetClass", e.target.value)}
                  >
                    <option value="" disabled>Select asset class</option>
                    {ASSET_CLASSES.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.assetClass && <p className="text-[#f85149] text-xs mt-1">{errors.assetClass}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-timeframe`}>
                  Timeframe
                </label>
                <div className="relative">
                  <select
                    id={`${formId}-timeframe`}
                    className={selectClass("timeframe")}
                    value={form.timeframe}
                    onChange={(e) => setField("timeframe", e.target.value)}
                  >
                    <option value="" disabled>Select timeframe</option>
                    {TIMEFRAMES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.timeframe && <p className="text-[#f85149] text-xs mt-1">{errors.timeframe}</p>}
              </div>
            </div>
          </div>

          {/* Section: Core Numbers */}
          <div className="px-6 py-5">
            <div className="text-xs text-[#484f58] tracking-widest uppercase mb-4">02 — Core Numbers</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-stop`}>
                  Stop Loss <span className="text-[#484f58]">(%)</span>
                </label>
                <input
                  id={`${formId}-stop`}
                  type="number"
                  step="0.1"
                  min="0.01"
                  placeholder="e.g. 1.5"
                  className={inputClass("stopPercent")}
                  value={form.stopPercent}
                  onChange={(e) => setField("stopPercent", e.target.value)}
                />
                {errors.stopPercent && <p className="text-[#f85149] text-xs mt-1">{errors.stopPercent}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-target`}>
                  Take Profit <span className="text-[#484f58]">(%)</span>
                </label>
                <input
                  id={`${formId}-target`}
                  type="number"
                  step="0.1"
                  min="0.01"
                  placeholder="e.g. 3.0"
                  className={inputClass("targetPercent")}
                  value={form.targetPercent}
                  onChange={(e) => setField("targetPercent", e.target.value)}
                />
                {errors.targetPercent && <p className="text-[#f85149] text-xs mt-1">{errors.targetPercent}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-risk`}>
                  Risk Per Trade <span className="text-[#484f58]">(%)</span>
                </label>
                <input
                  id={`${formId}-risk`}
                  type="number"
                  step="0.1"
                  min="0.01"
                  placeholder="e.g. 1.0"
                  className={inputClass("riskPerTradePercent")}
                  value={form.riskPerTradePercent}
                  onChange={(e) => setField("riskPerTradePercent", e.target.value)}
                />
                {errors.riskPerTradePercent && <p className="text-[#f85149] text-xs mt-1">{errors.riskPerTradePercent}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-trades`}>
                  Avg Trades Per Week
                </label>
                <input
                  id={`${formId}-trades`}
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 5"
                  className={inputClass("tradesPerWeek")}
                  value={form.tradesPerWeek}
                  onChange={(e) => setField("tradesPerWeek", e.target.value)}
                />
                {errors.tradesPerWeek && <p className="text-[#f85149] text-xs mt-1">{errors.tradesPerWeek}</p>}
              </div>
            </div>
          </div>

          {/* Section: Optional */}
          <div className="px-6 py-5">
            <div className="text-xs text-[#484f58] tracking-widest uppercase mb-1">03 — Optional</div>
            <p className="text-xs text-[#484f58] mb-4">Leave blank and the engine will use a conservative 45% assumption.</p>
            <div className="max-w-xs">
              <label className="block text-xs text-[#8b949e] mb-1.5" htmlFor={`${formId}-winrate`}>
                Historical Win Rate <span className="text-[#484f58]">(%)</span>
              </label>
              <input
                id={`${formId}-winrate`}
                type="number"
                step="1"
                min="1"
                max="99"
                placeholder="e.g. 52"
                className={inputClass("winRatePercent")}
                value={form.winRatePercent}
                onChange={(e) => setField("winRatePercent", e.target.value)}
              />
              {errors.winRatePercent && <p className="text-[#f85149] text-xs mt-1">{errors.winRatePercent}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="px-6 py-5">
            {apiError && (
              <div className="mb-4 px-4 py-3 bg-[#1a0a0a] border border-[#f85149] rounded text-[#f85149] text-xs">
                {apiError}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#484f58] text-[#010409] font-semibold text-sm rounded transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Strategy →"
              )}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[#484f58] text-xs mt-6 leading-relaxed">
          StrategyGrader provides mathematical analysis for educational purposes only. 
          Results are not financial advice. Past strategy structure does not guarantee future 
          trading performance. Always perform your own due diligence.
        </p>
      </div>
    </main>
  );
}
