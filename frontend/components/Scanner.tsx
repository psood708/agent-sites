"use client";

import { useState } from "react";
import Link from "next/link";
import ScoreGauge from "./ScoreGauge";
import ScoreTable from "./ScoreTable";
import RecommendationsPanel from "./RecommendationsPanel";
import LlmsTxtPanel from "./LlmsTxtPanel";
import ShareCard from "./ShareCard";

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

export default function Scanner({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanDuration, setScanDuration] = useState<number | null>(null);

  async function performScan(target: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    const t0 = Date.now();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Scan failed (${res.status})`);
      }
      const data: ScanResult = await res.json();
      setResult(data);
      setScanDuration((Date.now() - t0) / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    await performScan(url.startsWith("http") ? url : `https://${url}`);
  }

  function handleRescan() {
    if (result) performScan(result.url);
  }

  const domain = result
    ? (() => { try { return new URL(result.origin).hostname; } catch { return result.origin.replace(/^https?:\/\//, "").split("/")[0]; } })()
    : "";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24">
      {result ? (
        /* ── Post-scan: V2 URL bar ── */
        <div className="pt-8 pb-10">
          <div className="flex gap-2 items-center">
            <div
              className="flex-1 flex items-center gap-3 px-4 py-3 text-sm"
              style={{
                border: "1px solid var(--border-bright)",
                background: "var(--bg-card)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>↳</span>
              <span style={{ color: "var(--text-muted)" }}>https://</span>
              <span style={{ color: "var(--text)" }}>{domain}</span>
              {scanDuration !== null && (
                <span
                  className="ml-auto text-[11px]"
                  style={{ color: "var(--green)" }}
                >
                  ● scanned {scanDuration.toFixed(1)}s ago
                </span>
              )}
            </div>
            <button
              onClick={handleRescan}
              disabled={loading}
              className="px-4 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: "1px solid var(--border-bright)",
                color: "var(--text-muted)",
                background: "transparent",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--blue-border)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-bright)";
              }}
            >
              ↻ Rescan
            </button>
            <button
              onClick={() => {
                setResult(null);
                setScanDuration(null);
              }}
              className="px-3 py-3 text-sm"
              style={{
                border: "1px solid var(--border-bright)",
                color: "var(--text-muted)",
                background: "transparent",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              title="Scan a different URL"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* ── Pre-scan: headline + form ── */
        <div className="pt-20 pb-12">
          <div
            className="inline-block text-xs uppercase tracking-widest mb-6 px-3 py-1 rounded-sm"
            style={{
              color: "var(--blue)",
              border: "1px solid var(--blue-border)",
              background: "var(--blue-dim)",
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
            className="text-sm max-w-sm mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Score any site in seconds. Get a free /llms.txt.
          </p>

          <form onSubmit={handleScan}>
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
                      "var(--blue-border)")
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
                  background: loading ? "var(--blue-dim)" : "var(--blue)",
                  color: "var(--bg)",
                  border: "1px solid var(--blue)",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "Scanning…" : "Scan →"}
              </button>
            </div>
          </form>

          {/* Wishlist CTA */}
          <Link
            href="/pricing#survey"
            className="mt-6 flex items-center justify-between px-4 py-3 transition-all"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              textDecoration: "none",
              display: "flex",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-border)";
              (e.currentTarget as HTMLElement).style.background = "var(--blue-dim)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--blue)", flexShrink: 0 }} />
              <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                Help shape what we build
              </span>
              <span
                className="text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5"
                style={{
                  color: "var(--blue)",
                  border: "1px solid var(--blue-border)",
                  background: "var(--blue-dim)",
                }}
              >
                60s survey
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--blue)" }}>
              Join wishlist →
            </span>
          </Link>
        </div>
      )}

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
              style={{ background: "var(--blue)" }}
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
        <div className="space-y-10">
          <ScoreGauge score={result.score} grade={result.grade} domain={domain} />
          <ScoreTable checks={result.checks} />
          <RecommendationsPanel recommendations={result.recommendations} />
          <LlmsTxtPanel content={result.llms_txt_draft} domain={domain} />
          <ShareCard
            url={result.url}
            domain={domain}
            score={result.score}
            grade={result.grade}
            checks={result.checks}
          />

          {/* Post-scan wishlist CTA */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
            <Link
              href="/pricing#survey"
              className="flex items-center justify-between px-5 py-4 transition-all"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                textDecoration: "none",
                display: "flex",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-border)";
                (e.currentTarget as HTMLElement).style.background = "var(--blue-dim)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
                  Want score drop alerts + scan history?
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Join the wishlist — 60s survey, no spam.
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-[0.15em] ml-4 shrink-0" style={{ color: "var(--blue)" }}>
                Join →
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
