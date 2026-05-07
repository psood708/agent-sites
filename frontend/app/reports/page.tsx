import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Scan Log — AgentReadiness",
  description: "All sites scanned for AI agent readiness in the last 24 hours.",
};

interface ScanRow {
  domain: string;
  score: number;
  grade: string;
  passing: number;
  scanned_at: string;
}

const TOTAL_CHECKS = 8;
const PAGE_SIZE = 50;

type SearchParams = Promise<{ page?: string; range?: string }>;

const RANGES = [
  { label: "All", key: "all" },
  { label: "Excellent  80+", key: "excellent" },
  { label: "Good  60–79", key: "good" },
  { label: "Needs Work  40–59", key: "needs-work" },
  { label: "Poor  <40", key: "poor" },
];

function filterByRange(scans: ScanRow[], range: string): ScanRow[] {
  if (range === "excellent") return scans.filter((s) => s.score >= 80);
  if (range === "good") return scans.filter((s) => s.score >= 60 && s.score < 80);
  if (range === "needs-work") return scans.filter((s) => s.score >= 40 && s.score < 60);
  if (range === "poor") return scans.filter((s) => s.score < 40);
  return scans;
}

function buildUrl(range: string, page: number): string {
  const sp = new URLSearchParams();
  if (range !== "all") sp.set("range", range);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/reports?${qs}` : "/reports";
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--blue)";
  if (score >= 40) return "var(--amber)";
  return "var(--red)";
}

async function fetchScans(): Promise<ScanRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/recent`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, range: rangeParam } = await searchParams;
  const scans = await fetchScans();

  const range = RANGES.some((r) => r.key === rangeParam) ? (rangeParam ?? "all") : "all";
  const filtered = filterByRange(scans, range);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1") || 1), totalPages);
  const pageScans = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const rangeLabel = range !== "all" ? ` · ${RANGES.find((r) => r.key === range)?.label}` : "";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Back to scanner */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] back-link"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        <span style={{ color: "var(--blue)" }}>←</span>
        Scan a site
      </Link>

      {/* Header rail */}
      <div
        className="flex justify-between items-center pb-3 mb-8"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        <div className="flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
            Public Scan Log
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          {today}
        </span>
      </div>

      {/* Headline */}
      <div className="pb-10" style={{ borderBottom: "1px solid var(--text)" }}>
        <h1
          className="text-5xl sm:text-6xl font-normal leading-[0.92] tracking-[-0.04em] m-0"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          Sites scanned
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>in the last</em>
          <br />
          24 hours.
        </h1>
        <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {scans.length > 0
            ? `${filtered.length} scan${filtered.length !== 1 ? "s" : ""}${rangeLabel} · ${scans.length} total in 24 h · cached per domain.`
            : "No scans recorded yet, or database not configured."}
        </p>
      </div>

      {/* Score-range filter */}
      {scans.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {RANGES.map((r) => {
            const isActive = r.key === range;
            return (
              <a
                key={r.key}
                href={buildUrl(r.key, 1)}
                className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5"
                style={{
                  color: isActive ? "var(--blue)" : "var(--text-muted)",
                  background: isActive ? "var(--blue-dim)" : "transparent",
                  border: `1px solid ${isActive ? "var(--blue-border)" : "var(--border)"}`,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {r.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Table */}
      {scans.length > 0 ? (
        <div className="mt-6">
          {filtered.length === 0 ? (
            <p className="text-sm mt-8" style={{ color: "var(--text-muted)" }}>
              No scans match this filter.{" "}
              <a href="/reports" style={{ color: "var(--blue)", textDecoration: "none" }}>
                Clear filter →
              </a>
            </p>
          ) : (
            <>
              {/* Column headers */}
              <div
                className="reports-grid text-[10px] uppercase tracking-[0.2em] pb-2.5"
                style={{
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>Domain</span>
                <span className="text-right">Score</span>
                <span className="text-center">Grade</span>
                <span className="reports-col-checks text-right">Checks</span>
                <span className="reports-col-time text-right">Time</span>
              </div>

              {pageScans.map((row, i) => {
                const color = scoreColor(row.score);
                const displayDomain = row.domain.replace(/^https?:\/\//, "");
                const shareUrl = `/score?url=${encodeURIComponent(displayDomain)}&score=${row.score}&grade=${encodeURIComponent(row.grade)}&passing=${row.passing}&total=${TOTAL_CHECKS}`;
                return (
                  <a
                    key={i}
                    href={shareUrl}
                    className="scan-row reports-grid items-center py-3 transition-all"
                    style={{
                      borderBottom: "1px dotted var(--border)",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <span className="text-sm font-medium truncate pr-2" style={{ color: "var(--text)" }}>
                      {displayDomain}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-right" style={{ color }}>
                      {row.score}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className="text-[10px] uppercase tracking-[0.12em] py-0.5 font-bold text-center"
                        style={{
                          color,
                          background: `color-mix(in srgb, ${color} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                          minWidth: "72px",
                          display: "inline-block",
                        }}
                      >
                        {row.grade}
                      </span>
                    </span>
                    <span
                      className="reports-col-checks text-[11px] tabular-nums text-right"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {row.passing}/{TOTAL_CHECKS}
                    </span>
                    <span
                      className="reports-col-time text-[11px] text-right"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {timeAgo(row.scanned_at)}
                    </span>
                  </a>
                );
              })}

              {/* Footer: entry count + pagination */}
              <div
                className="flex justify-between items-center mt-4 pt-4 text-[11px] uppercase tracking-[0.12em]"
                style={{ color: "var(--text-muted)", borderTop: "1px solid var(--text)" }}
              >
                <span>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>

                {totalPages > 1 && (
                  <div className="flex gap-5 items-center">
                    {page > 1 ? (
                      <a
                        href={buildUrl(range, page - 1)}
                        style={{ color: "var(--blue)", textDecoration: "none" }}
                      >
                        ← Prev
                      </a>
                    ) : (
                      <span style={{ opacity: 0.3 }}>← Prev</span>
                    )}
                    <span>
                      {page} / {totalPages}
                    </span>
                    {page < totalPages ? (
                      <a
                        href={buildUrl(range, page + 1)}
                        style={{ color: "var(--blue)", textDecoration: "none" }}
                      >
                        Next →
                      </a>
                    ) : (
                      <span style={{ opacity: 0.3 }}>Next →</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No scans yet.{" "}
            <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>
              Scan the first site →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
