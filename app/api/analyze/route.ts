import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeStrategy } from "@/lib/scoringEngine";

// ─── Validation Schema ────────────────────────────────────────────────────────
const StrategyInputSchema = z.object({
  strategyName: z.string().min(1, "Strategy name is required").max(100),
  assetClass: z.string().min(1, "Asset class is required"),
  timeframe: z.enum(["scalp", "intraday", "swing", "position"]),
  stopPercent: z
    .number()
    .positive("Stop % must be positive")
    .max(50, "Stop % seems unrealistically large"),
  targetPercent: z
    .number()
    .positive("Target % must be positive")
    .max(100, "Target % seems unrealistically large"),
  riskPerTradePercent: z
    .number()
    .positive("Risk per trade must be positive")
    .max(100),
  tradesPerWeek: z
    .number()
    .positive()
    .max(200, "Trades per week seems unrealistically high"),
  winRatePercent: z
    .number()
    .min(1)
    .max(99)
    .optional(),
  sessionId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = StrategyInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { sessionId, ...input } = parsed.data;
    const report = analyzeStrategy(input, sessionId);

    return NextResponse.json(report, { status: 200 });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
