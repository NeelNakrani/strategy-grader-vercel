import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "StrategyGrader – Strategy Quality Analyzer for Retail Traders",
  description:
    "Evaluate your trading strategy's risk/reward, expectancy, and structural quality. Get an objective A–F grade with specific improvement suggestions.",
  keywords: ["trading strategy", "risk reward", "expectancy", "prop firm", "strategy grader"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body>{children}</body>
    </html>
  );
}
