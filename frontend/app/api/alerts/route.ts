import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SITE_URL = "https://agent-sites-five.vercel.app";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "alerts@agentreadiness.com";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WatchedUrl {
  id: string;
  user_email: string;
  url: string;
  last_score: number | null;
}

interface ScanResult {
  score: number;
  grade: string;
}

async function rescanUrl(url: string): Promise<ScanResult | null> {
  try {
    const res = await fetch(`${API_URL}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function patchScore(watchId: string, score: number): Promise<void> {
  await fetch(`${API_URL}/watch/${watchId}/score?score=${score}`, {
    method: "PATCH",
    headers: { "x-cron-secret": CRON_SECRET },
  });
}

async function sendDropAlert(
  email: string,
  url: string,
  oldScore: number,
  newScore: number,
  grade: string,
): Promise<void> {
  const drop = oldScore - newScore;
  const domain = new URL(url).hostname;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Score alert: ${domain} dropped ${drop} points`,
    text: [
      `Your AgentReadiness score for ${domain} has dropped.`,
      ``,
      `Previous score: ${oldScore}`,
      `Current score:  ${newScore} (${grade})`,
      `Drop:           −${drop} points`,
      ``,
      `View your dashboard: ${SITE_URL}/dashboard`,
      `Run a full scan:     ${SITE_URL}/?url=${encodeURIComponent(url)}`,
      ``,
      `— AgentReadiness`,
    ].join("\n"),
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchRes = await fetch(`${API_URL}/watches/all`, {
    headers: { "x-cron-secret": CRON_SECRET },
  });
  if (!watchRes.ok) {
    return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 });
  }

  const watches: WatchedUrl[] = await watchRes.json();
  const results = { total: watches.length, scanned: 0, alerts_sent: 0, errors: 0 };

  for (const watch of watches) {
    const result = await rescanUrl(watch.url);
    if (!result) { results.errors++; continue; }

    results.scanned++;
    await patchScore(watch.id, result.score);

    const lastScore = watch.last_score ?? result.score;
    if (lastScore - result.score >= 10) {
      await sendDropAlert(watch.user_email, watch.url, lastScore, result.score, result.grade);
      results.alerts_sent++;
    }
  }

  return NextResponse.json(results);
}
