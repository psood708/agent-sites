"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import ScoreTable from "./ScoreTable";
import RecommendationsPanel from "./RecommendationsPanel";
import LlmsTxtPanel from "./LlmsTxtPanel";

interface ScanResult {
  url: string;
  origin: string;
  score: number;
  grade: string;
  checks: Record<
    string,
    { pass: boolean; detail: string; weight: number; label: string; data: unknown }
  >;
  recommendations: { label: string; weight: number }[];
  llms_txt_draft: string;
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const normalized = url.startsWith("http") ? url : `https://${url}`;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Scan failed (${res.status})`);
      }

      const data: ScanResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const domain = result
    ? new URL(result.origin).hostname
    : "";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <div
          className="inline-block text-xs uppercase tracking-widest mb-6 px-3 py-1 rounded-sm"
          style={{
            color: "var(--green)",
            border: "1px solid rgba(0,255,136,0.2)",
            background: "var(--green-dim)",
          }}
        >
          Agent Readiness Scanner
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--text)" }}
        >
          Is your website ready
          <br />
          for AI agents?
        </h1>
        <p
          className="text-sm max-w-sm mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Score any site in seconds. Get a free /llms.txt.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleScan} className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none"
              style={{ color: "var(--text-muted)" }}
            >
              https://
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yoursite.com"
              className="w-full pl-20 pr-4 py-3 text-sm rounded-sm outline-none transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-bright)",
                color: "var(--text)",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(0,255,136,0.4)")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "var(--border-bright)")
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 text-sm font-medium rounded-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: loading ? "var(--green-dim)" : "var(--green)",
              color: "#000",
              border: "1px solid var(--green)",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Scanning…" : "Scan →"}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div
          className="rounded-sm p-6 text-center"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
          }}
        >
          <div
            className="relative h-1 rounded-full overflow-hidden mb-4 mx-auto"
            style={{ background: "var(--border)", maxWidth: "200px" }}
          >
            <div
              className="scanning absolute inset-y-0 left-0 w-1/3 rounded-full"
              style={{ background: "var(--green)" }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Running 8 diagnostic checks
            <span className="cursor" />
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="fade-up rounded-sm p-4 text-sm"
          style={{
            border: "1px solid rgba(248,113,113,0.3)",
            background: "var(--red-dim)",
            color: "var(--red)",
          }}
        >
          ✕ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <ScoreGauge score={result.score} grade={result.grade} />
          <ScoreTable checks={result.checks} />
          <RecommendationsPanel recommendations={result.recommendations} />
          <LlmsTxtPanel content={result.llms_txt_draft} domain={domain} />
        </div>
      )}
    </div>
  );
}
