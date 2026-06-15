import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WatchButton from "@/components/WatchButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — AgentReadiness",
};

interface ScanRow {
  url: string;
  domain: string;
  score: number;
  grade: string;
  scanned_at: string;
}

interface WatchRow {
  id: string;
  url: string;
  last_score: number | null;
  last_scanned_at: string | null;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--blue)";
  if (score >= 40) return "var(--amber)";
  return "var(--red)";
}

async function fetchFromBackend<T>(path: string, token: string): Promise<T[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const [scans, watched] = await Promise.all([
    fetchFromBackend<ScanRow>("/user/scans", token),
    fetchFromBackend<WatchRow>("/watch", token),
  ]);

  const watchedUrls = new Set(watched.map((w) => w.url));

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] back-link"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        <span style={{ color: "var(--blue)" }}>←</span>
        Back to scanner
      </Link>

      {/* Header */}
      <div
        className="flex justify-between items-center pb-3 mb-8"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        <div className="flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
            Dashboard
          </span>
        </div>
        <span
          className="text-[11px] uppercase tracking-[0.15em] max-w-[200px] truncate"
          style={{ color: "var(--text-muted)" }}
          title={user.email}
        >
          {user.email}
        </span>
      </div>

      {/* Headline */}
      <div className="pb-10" style={{ borderBottom: "1px solid var(--text)" }}>
        <h1
          className="text-5xl font-normal leading-[0.92] tracking-[-0.04em] m-0"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          Your scan
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>history.</em>
        </h1>
        <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {scans.length > 0
            ? `${scans.length} scan${scans.length !== 1 ? "s" : ""} recorded. Hit Watch on any row to get email alerts when the score drops.`
            : "No scans yet. Scans run while signed in are saved here."}
        </p>
      </div>

      {/* ── Scan history ── */}
      {scans.length > 0 ? (
        <div className="mt-8">
          <div
            className="dashboard-grid text-[10px] uppercase tracking-[0.2em] pb-2.5"
            style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
          >
            <span>Site</span>
            <span className="text-right">Score</span>
            <span className="text-center">Grade</span>
            <span className="dashboard-col-time text-right">When</span>
            <span className="dashboard-col-watch" />
          </div>

          {scans.map((row, i) => {
            const color = scoreColor(row.score);
            return (
              <div
                key={i}
                className="dashboard-grid items-center py-3"
                style={{ borderBottom: "1px dotted var(--border)" }}
              >
                <a
                  href={`/?url=${encodeURIComponent(row.url)}`}
                  className="scan-row text-sm font-medium truncate pr-2"
                  style={{ color: "var(--text)", textDecoration: "none" }}
                >
                  {row.domain}
                </a>
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
                  className="dashboard-col-time text-[11px] text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {timeAgo(row.scanned_at)}
                </span>
                <span className="dashboard-col-watch flex justify-end">
                  <WatchButton
                    url={row.url}
                    score={row.score}
                    initialWatching={watchedUrls.has(row.url)}
                  />
                </span>
              </div>
            );
          })}

          <div
            className="flex justify-between items-center mt-4 pt-4 text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "var(--text-muted)", borderTop: "1px solid var(--text)" }}
          >
            <span>{scans.length} total scan{scans.length !== 1 ? "s" : ""}</span>
            <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>
              + Scan another site →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your history will appear here.{" "}
            <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>
              Scan your first site →
            </Link>
          </p>
        </div>
      )}

      {/* ── Watching section ── */}
      {watched.length > 0 && (
        <div className="mt-16">
          <div
            className="flex items-center gap-2.5 pb-3 mb-6"
            style={{ borderBottom: "1px solid var(--text)" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue)", flexShrink: 0 }} />
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
              Watching
            </span>
            <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
              · {watched.length} / 10
            </span>
          </div>
          <p className="text-[12px] mb-6" style={{ color: "var(--text-muted)" }}>
            We re-scan these daily. You&apos;ll get an email if the score drops 10+ points.
          </p>

          <div
            className="text-[10px] uppercase tracking-[0.2em] pb-2.5 grid"
            style={{
              gridTemplateColumns: "1fr 64px 96px",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>Site</span>
            <span className="text-right">Score</span>
            <span className="text-right">Last checked</span>
          </div>

          {watched.map((w, i) => {
            const color = w.last_score != null ? scoreColor(w.last_score) : "var(--text-muted)";
            let domain = w.url;
            try { domain = new URL(w.url).hostname; } catch { /* keep raw */ }
            return (
              <div
                key={i}
                className="grid items-center py-3"
                style={{
                  gridTemplateColumns: "1fr 64px 96px 60px",
                  borderBottom: "1px dotted var(--border)",
                }}
              >
                <span className="text-sm truncate pr-2" style={{ color: "var(--text)" }}>
                  {domain}
                </span>
                <span className="text-sm font-bold tabular-nums text-right" style={{ color }}>
                  {w.last_score ?? "—"}
                </span>
                <span className="text-[11px] text-right" style={{ color: "var(--text-muted)" }}>
                  {w.last_scanned_at ? timeAgo(w.last_scanned_at) : "—"}
                </span>
                <span className="flex justify-end">
                  <WatchButton url={w.url} score={w.last_score ?? 0} initialWatching={true} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
