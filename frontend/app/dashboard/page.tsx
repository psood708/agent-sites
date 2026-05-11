import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--blue)";
  if (score >= 40) return "var(--amber)";
  return "var(--red)";
}

async function fetchUserScans(accessToken: string): Promise<ScanRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/user/scans`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
  const scans = session?.access_token ? await fetchUserScans(session.access_token) : [];

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

      <div
        className="flex justify-between items-center pb-3 mb-8"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        <div className="flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
            My Scans
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
            ? `${scans.length} scan${scans.length !== 1 ? "s" : ""} recorded while signed in.`
            : "No scans yet. Scans run while signed in are saved here."}
        </p>
      </div>

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
          </div>

          {scans.map((row, i) => {
            const color = scoreColor(row.score);
            return (
              <a
                key={i}
                href={`/?url=${encodeURIComponent(row.url)}`}
                className="scan-row dashboard-grid items-center py-3 transition-all"
                style={{ borderBottom: "1px dotted var(--border)", textDecoration: "none", color: "inherit" }}
              >
                <span className="text-sm font-medium truncate pr-2" style={{ color: "var(--text)" }}>
                  {row.domain}
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
                  className="dashboard-col-time text-[11px] text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {timeAgo(row.scanned_at)}
                </span>
              </a>
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
    </div>
  );
}
