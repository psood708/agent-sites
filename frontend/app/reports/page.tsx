import type { Metadata } from "next";

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

export default async function ReportsPage() {
  const scans = await fetchScans();

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Back to scanner */}
      <a
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] back-link"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        <span style={{ color: "var(--blue)" }}>←</span>
        Scan a site
      </a>

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
            ? `${scans.length} scan${scans.length !== 1 ? "s" : ""} recorded. Results cached for 24 hours per domain.`
            : "No scans recorded yet, or database not configured."}
        </p>
      </div>

      {/* Table */}
      {scans.length > 0 ? (
        <div className="mt-8">
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

          {scans.map((row, i) => {
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
                {/* Domain */}
                <span className="text-sm font-medium truncate pr-2" style={{ color: "var(--text)" }}>
                  {displayDomain}
                </span>

                {/* Score */}
                <span
                  className="text-sm font-bold tabular-nums text-right"
                  style={{ color }}
                >
                  {row.score}
                </span>

                {/* Grade badge */}
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

                {/* Checks */}
                <span
                  className="reports-col-checks text-[11px] tabular-nums text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.passing}/{TOTAL_CHECKS}
                </span>

                {/* Time */}
                <span
                  className="reports-col-time text-[11px] text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {timeAgo(row.scanned_at)}
                </span>
              </a>
            );
          })}

          {/* Footer rule */}
          <div
            className="flex justify-between mt-4 pt-4 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "var(--text-muted)", borderTop: "1px solid var(--text)" }}
          >
            <span>Showing last 24 hours</span>
            <span>{scans.length} entries</span>
          </div>
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No scans yet.{" "}
            <a href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>
              Scan the first site →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
