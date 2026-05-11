"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ScoreGauge from "./ScoreGauge";
import ScoreTable from "./ScoreTable";
import RecommendationsPanel from "./RecommendationsPanel";
import LlmsTxtPanel from "./LlmsTxtPanel";
import ShareCard from "./ShareCard";

interface StatsData {
  total_scans: number;
  avg_score: number;
  grade_distribution: Record<string, number>;
  check_pass_rates: Record<string, number>;
}

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

const CHECK_LABELS: Record<string, string> = {
  llms_txt: "/llms.txt", robots_txt: "robots.txt AI rules", sitemap: "sitemap.xml",
  json_ld: "JSON-LD", opengraph: "OpenGraph", meta: "Title + meta",
  canonical: "Canonical URL", clean_content: "Clean content",
};

export default function Scanner({ initialUrl, stats }: { initialUrl?: string; stats: StatsData }) {
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
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const res = await fetch(`${apiUrl}/scan`, {
        method: "POST",
        headers,
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

          {/* Live stats strip */}
          {stats.total_scans > 0 && (() => {
            const worstCheck = Object.entries(stats.check_pass_rates).sort((a, b) => a[1] - b[1])[0];
            return (
              <div
                className="mt-4 grid grid-cols-3 text-center"
                style={{ border: "1px solid var(--border)" }}
              >
                {[
                  { label: "Sites scanned", value: stats.total_scans.toLocaleString(), color: "var(--text)" },
                  { label: "Avg score", value: `${stats.avg_score} / 100`, color: "var(--blue)" },
                  { label: `${worstCheck ? Math.round(100 - worstCheck[1]) : 0}% miss`, value: worstCheck ? CHECK_LABELS[worstCheck[0]] : "—", color: "var(--red)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-3 py-3" style={{ borderRight: "1px solid var(--border)" }}>
                    <div className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
                    <div className="text-[12px] font-medium tabular-nums truncate" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            );
          })()}
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
          {/* Proof + survey strip above results */}
          {(() => {
            const failedChecks = Object.entries(result.checks)
              .filter(([, c]) => !c.pass)
              .sort((a, b) => b[1].weight - a[1].weight)
              .slice(0, 3);
            return (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-0"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Why it matters — failed checks */}
                <div className="px-5 py-4" style={{ borderRight: "1px solid var(--border)" }}>
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--text-muted)" }}>
                    Why this score matters
                  </div>
                  {failedChecks.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {failedChecks.map(([key, check]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="text-[11px] mt-0.5" style={{ color: "var(--red)" }}>✕</span>
                          <div>
                            <span className="text-[12px]" style={{ color: "var(--text)" }}>{check.label}</span>
                            <span className="text-[11px] ml-2" style={{ color: "var(--text-muted)" }}>−{check.weight} pts</span>
                          </div>
                        </div>
                      ))}
                      <Link
                        href="/why"
                        className="mt-1 text-[11px] uppercase tracking-[0.12em]"
                        style={{ color: "var(--blue)", textDecoration: "none" }}
                      >
                        Why these checks matter →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-[12px]" style={{ color: "var(--green)" }}>
                      All checks passed — your site is fully agent-ready.
                    </p>
                  )}
                </div>
                {/* Survey CTA */}
                <Link
                  href="/pricing#survey"
                  className="px-5 py-4 flex flex-col justify-between transition-all"
                  style={{ textDecoration: "none", background: "var(--bg-card)", display: "flex" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--blue-dim)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                  }}
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--blue)" }}>
                      Want score alerts + history?
                    </div>
                    <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                      Join the wishlist. 60s survey, no spam. Your answers shape what ships next.
                    </p>
                  </div>
                  <span className="mt-3 text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--blue)" }}>
                    Join wishlist →
                  </span>
                </Link>
              </div>
            );
          })()}

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

        </div>
      )}
    </div>
  );
}
