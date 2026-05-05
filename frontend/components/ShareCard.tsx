"use client";

import { useState } from "react";

interface Check {
  pass: boolean;
  label: string;
  weight: number;
}

interface Props {
  url: string;
  domain: string;
  score: number;
  grade: string;
  checks: Record<string, Check>;
}

const CHECK_ORDER = [
  "llms_txt",
  "json_ld",
  "clean_content",
  "opengraph",
  "meta",
  "canonical",
  "robots_txt",
  "sitemap",
];

const SHORT_LABELS: Record<string, string> = {
  llms_txt: "/llms.txt",
  json_ld: "JSON-LD",
  clean_content: "Content",
  opengraph: "OpenGraph",
  meta: "Meta tags",
  canonical: "Canonical",
  robots_txt: "robots.txt",
  sitemap: "sitemap.xml",
};

const DIST = [2, 4, 7, 11, 14, 16, 14, 12, 10, 6, 3, 1];

export default function ShareCard({ url, domain, score, grade, checks }: Props) {
  const [copied, setCopied] = useState(false);

  const passing = CHECK_ORDER.filter((k) => checks[k]?.pass).length;
  const total = CHECK_ORDER.filter((k) => checks[k]).length;
  const passingKeys = CHECK_ORDER.filter((k) => checks[k]?.pass).join(",");
  const bucket = Math.min(Math.floor(score / 10), 11);
  const percentile = DIST.slice(0, bucket + 1).reduce((a, b) => a + b, 0);

  const biggestMiss = CHECK_ORDER.filter(
    (k) => checks[k] && !checks[k].pass
  ).sort((a, b) => checks[b].weight - checks[a].weight)[0];
  const missLabel = biggestMiss ? SHORT_LABELS[biggestMiss] : "key checks";

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/score?url=${encodeURIComponent(domain)}&score=${score}&grade=${encodeURIComponent(grade)}&passing=${passing}&total=${total}&passing_keys=${encodeURIComponent(passingKeys)}`
      : `/score?url=${encodeURIComponent(domain)}&score=${score}&grade=${encodeURIComponent(grade)}&passing=${passing}&total=${total}&passing_keys=${encodeURIComponent(passingKeys)}`;

  const tweetPreview = `We just scored ${score}/100 on agentreadiness — better than ${percentile}% of sites, but missing ${missLabel}.\nScore your site: agentreadiness.dev/?u=${domain}`;

  const tweetText = `We just scored ${domain} for AI agent readiness:\n\n${score}/100 — ${grade}\n${passing}/${total} checks passing\n\nAI crawlers are the new Googlebot. Is your site ready?\n`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleTweet() {
    const encoded = encodeURIComponent(tweetText);
    const urlEncoded = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${encoded}&url=${urlEncoded}`,
      "_blank",
      "noopener"
    );
  }

  function handleLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <div className="fade-up-4 space-y-2">
      {/* Section label */}
      <div
        className="text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "var(--text-muted)" }}
      >
        Challenge card
      </div>

      <div
        className="rounded-sm overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--blue-border)",
          boxShadow: "0 0 60px var(--blue-dim)",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-medium"
            style={{ color: "var(--blue)" }}
          >
            ▲ agentreadiness · challenge
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            {domain}
          </span>
        </div>

        {/* Challenge headline */}
        <div className="px-5 pt-5">
          <div
            className="text-lg leading-snug tracking-[-0.01em]"
            style={{ color: "var(--text)" }}
          >
            We scored{" "}
            <span className="font-bold" style={{ color: "var(--blue)" }}>
              {score}/100
            </span>{" "}
            on agent readiness.
            <br />
            <span style={{ color: "var(--text-muted)" }}>
              Can your site do better?
            </span>
          </div>
        </div>

        {/* Slider gauge */}
        <div className="px-5 pt-5 pb-2">
          <div
            className="flex justify-between text-[10px] uppercase tracking-[0.15em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            <span>0 · invisible</span>
            <span>100 · agent-ready</span>
          </div>
          <div
            className="relative h-1.5 rounded-full"
            style={{ background: "var(--border)" }}
          >
            {/* Distribution band */}
            <div
              className="absolute inset-y-0 rounded-full"
              style={{
                left: "30%",
                right: "20%",
                background: "var(--blue-dim)",
              }}
            />
            {/* Avg marker */}
            <div
              className="absolute top-0 bottom-0 w-px"
              style={{ left: "41%", background: "var(--border-bright)" }}
            />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, var(--blue-dim) 0%, var(--blue) 100%)`,
              }}
            />
            {/* Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
              style={{
                left: `${score}%`,
                background: "var(--blue)",
                boxShadow: "0 0 12px var(--blue), 0 0 0 3px var(--bg-card)",
              }}
            />
          </div>
          <div
            className="relative h-4 mt-1.5 text-[9px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="absolute -translate-x-1/2" style={{ left: "41%" }}>
              web avg · 41
            </span>
            <span
              className="absolute -translate-x-1/2 font-medium"
              style={{ left: `${score}%`, color: "var(--blue)" }}
            >
              ▼ you · {score}
            </span>
            <span className="absolute -translate-x-1/2" style={{ left: "88%" }}>
              top · 88
            </span>
          </div>
        </div>

        {/* Score box + check grid */}
        <div
          className="px-5 pb-5 grid gap-6"
          style={{ gridTemplateColumns: "150px 1fr", alignItems: "center" }}
        >
          {/* Score box */}
          <div
            className="text-center py-4"
            style={{
              border: "1px solid var(--blue-border)",
              background:
                "linear-gradient(180deg, var(--blue-dim) 0%, transparent 100%)",
            }}
          >
            <div
              className="text-5xl font-bold leading-none tracking-[-0.04em] tabular-nums"
              style={{ color: "var(--blue)" }}
            >
              {score}
            </div>
            <div
              className="mt-1 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              / 100 · {grade}
            </div>
            <div
              className="mt-2.5 mx-3"
              style={{ height: "1px", background: "var(--border)" }}
            />
            <div
              className="mt-2 text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              {passing}/{total} passing
            </div>
          </div>

          {/* Check grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {CHECK_ORDER.filter((k) => checks[k]).map((k) => {
              const pass = checks[k].pass;
              return (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      color: pass ? "var(--green)" : "var(--red)",
                      background: pass
                        ? "rgba(74,222,128,0.08)"
                        : "rgba(248,113,113,0.08)",
                      border: `1px solid ${pass ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                    }}
                  >
                    {pass ? "✓" : "✕"}
                  </span>
                  <span
                    className="text-[11px] flex-1 truncate"
                    style={{
                      color: pass ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {SHORT_LABELS[k]}
                  </span>
                  <span
                    className="text-[10px] tabular-nums"
                    style={{
                      color: pass ? "var(--green)" : "var(--text-muted)",
                    }}
                  >
                    {checks[k].weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tweet preview */}
        <div
          className="px-5 py-3"
          style={{
            borderTop: "1px solid var(--border)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="text-[9px] uppercase tracking-[0.2em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Your post — preview
          </div>
          <div
            className="px-3 py-2.5 text-xs leading-relaxed"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          >
            We just scored{" "}
            <span style={{ color: "var(--blue)" }}>{score}/100</span> on
            agentreadiness{" "}
            <span style={{ color: "var(--text-muted)" }}>
              — better than {percentile}% of sites, but missing{" "}
              <span style={{ color: "var(--red)" }}>{missLabel}</span>.
            </span>
            <br />
            <span style={{ color: "var(--text-muted)" }}>Score your site:</span>{" "}
            <span style={{ color: "var(--blue)" }}>
              agentreadiness.dev/?u={domain}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div
          className="flex gap-2 p-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={handleTweet}
            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer transition-opacity hover:opacity-90"
            style={{
              background: "var(--blue)",
              border: "none",
              color: "var(--bg)",
              fontFamily: "inherit",
            }}
          >
            Post &amp; challenge →
          </button>
          <button
            onClick={handleLinkedIn}
            className="px-4 py-3 text-[11px] uppercase tracking-[0.15em] cursor-pointer"
            style={{
              background: "transparent",
              border: "1px solid var(--border-bright)",
              color: "var(--text-muted)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#0a66c2";
              (e.currentTarget as HTMLElement).style.borderColor = "#0a66c2";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-bright)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)";
            }}
          >
            in
          </button>
          <button
            onClick={handleCopy}
            data-testid="copy-btn"
            className="px-4 py-3 text-[11px] uppercase tracking-[0.15em] cursor-pointer transition-all"
            style={{
              background: copied ? "var(--blue-dim)" : "transparent",
              border: `1px solid ${copied ? "var(--blue-border)" : "var(--border-bright)"}`,
              color: copied ? "var(--blue)" : "var(--text-muted)",
              fontFamily: "inherit",
            }}
          >
            {copied ? "✓" : "⧉"}
          </button>
        </div>
      </div>
    </div>
  );
}
