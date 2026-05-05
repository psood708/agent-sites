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

export default function ShareCard({ url, domain, score, grade, checks }: Props) {
  const [copied, setCopied] = useState(false);

  const passing = CHECK_ORDER.filter((k) => checks[k]?.pass).length;
  const total = CHECK_ORDER.filter((k) => checks[k]).length;

  const scoreColor =
    score >= 70 ? "var(--blue)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const scoreDim =
    score >= 70
      ? "var(--blue-dim)"
      : score >= 40
      ? "var(--amber-dim)"
      : "var(--red-dim)";
  const scoreBorder =
    score >= 70
      ? "var(--blue-border)"
      : score >= 40
      ? "rgba(245,158,11,0.3)"
      : "rgba(248,113,113,0.3)";

  const passingKeys = CHECK_ORDER.filter((k) => checks[k]?.pass).join(",");

  // Build the canonical shareable URL
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/score?url=${encodeURIComponent(domain)}&score=${score}&grade=${encodeURIComponent(grade)}&passing=${passing}&total=${total}&passing_keys=${encodeURIComponent(passingKeys)}`
      : `/score?url=${encodeURIComponent(domain)}&score=${score}&grade=${encodeURIComponent(grade)}&passing=${passing}&total=${total}&passing_keys=${encodeURIComponent(passingKeys)}`;

  const tweetText = `I just scored ${domain} for AI agent readiness:\n\n${score}/100 — ${grade}\n${passing}/${total} checks passing\n\nAI crawlers are the new Googlebot. Is your site ready?\n`;

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
    const urlEncoded = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <div className="fade-up-4 space-y-3">
      {/* Section label */}
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Share Results
      </div>

      {/* Card preview — mirrors the OG image layout */}
      <div
        className="rounded-sm overflow-hidden"
        style={{
          border: `1px solid ${scoreBorder}`,
          background: "var(--bg-card)",
          boxShadow: `0 0 40px ${scoreDim}`,
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: "var(--blue)" }}
          >
            agentreadiness
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider"
            style={{
              color: scoreColor,
              background: scoreDim,
              border: `1px solid ${scoreBorder}`,
            }}
          >
            {grade}
          </span>
        </div>

        {/* Card body */}
        <div className="flex gap-0">
          {/* Left: score + domain */}
          <div
            className="flex-1 px-5 py-6"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <div
              className="text-6xl font-bold tracking-tighter leading-none"
              style={{ color: scoreColor }}
            >
              {score}
              <span
                className="text-xl font-light"
                style={{ color: "var(--text-muted)" }}
              >
                {" "}
                / 100
              </span>
            </div>
            <div
              className="mt-4 text-base font-medium truncate"
              style={{ color: "var(--text)" }}
            >
              {domain}
            </div>
            <div
              className="mt-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {passing} of {total} checks passing
            </div>
          </div>

          {/* Right: check dots */}
          <div className="px-5 py-6 flex flex-col justify-center gap-2">
            {CHECK_ORDER.filter((k) => checks[k]).map((key) => {
              const check = checks[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: check.pass
                        ? "var(--green)"
                        : "var(--text-muted)",
                      boxShadow: check.pass
                        ? "0 0 4px var(--green)"
                        : undefined,
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: check.pass ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {SHORT_LABELS[key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share buttons */}
        <div
          className="flex gap-2 px-5 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* X / Twitter */}
          <button
            onClick={handleTweet}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-sm transition-all cursor-pointer"
            style={{
              background: "transparent",
              border: "1px solid var(--border-bright)",
              color: "var(--text-muted)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#fff";
              (e.currentTarget as HTMLElement).style.background = "#000";
              (e.currentTarget as HTMLElement).style.borderColor = "#333";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            Share on X
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedIn}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-sm transition-all cursor-pointer"
            style={{
              background: "transparent",
              border: "1px solid var(--border-bright)",
              color: "var(--text-muted)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#fff";
              (e.currentTarget as HTMLElement).style.background = "#0a66c2";
              (e.currentTarget as HTMLElement).style.borderColor = "#0a66c2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-sm transition-all cursor-pointer"
            style={{
              background: copied ? "var(--blue-dim)" : "transparent",
              border: `1px solid ${copied ? "var(--blue-border)" : "var(--border-bright)"}`,
              color: copied ? "var(--blue)" : "var(--text-muted)",
              fontFamily: "inherit",
            }}
          >
            {copied ? "✓ Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
