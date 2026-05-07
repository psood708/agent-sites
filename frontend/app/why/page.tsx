import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why it matters — AgentReadiness",
  description:
    "Live data on how prepared the web is for AI agents, why each check matters, and real before/after examples.",
};

interface StatsData {
  total_scans: number;
  avg_score: number;
  grade_distribution: Record<string, number>;
  check_pass_rates: Record<string, number>;
}

async function fetchStats(): Promise<StatsData> {
  const empty: StatsData = {
    total_scans: 0,
    avg_score: 0,
    grade_distribution: { Excellent: 0, Good: 0, "Needs work": 0, Poor: 0 },
    check_pass_rates: {
      llms_txt: 0, robots_txt: 0, sitemap: 0, json_ld: 0,
      opengraph: 0, meta: 0, canonical: 0, clean_content: 0,
    },
  };
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${apiUrl}/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

function barColor(rate: number): string {
  if (rate >= 70) return "var(--green)";
  if (rate >= 40) return "var(--amber)";
  return "var(--red)";
}

function gradeColor(grade: string): string {
  if (grade === "Excellent") return "var(--blue)";
  if (grade === "Good") return "var(--green)";
  if (grade === "Needs work") return "var(--amber)";
  return "var(--red)";
}

const CHECK_EXPLANATIONS = [
  {
    key: "llms_txt", label: "/llms.txt file", weight: 25, icon: "◈",
    why: "The emerging standard for telling AI agents exactly what your site does, what pages matter, and what to do with them. Without it, agents guess — and guess wrong.",
    impact: "The single highest-weight check. Missing it is like removing your homepage from every AI index.",
  },
  {
    key: "json_ld", label: "JSON-LD structured data", weight: 15, icon: "{}",
    why: "Machine-readable metadata that tells agents your entity type, name, description, and relationships. Used by every major LLM training pipeline and retrieval system.",
    impact: "Agents that can't parse your type skip your content during indexing.",
  },
  {
    key: "clean_content", label: "Clean content", weight: 15, icon: "▤",
    why: "AI agents retrieve your pages via headless readers, not browsers. If your content is buried in JS-heavy templates, ads, or infinite scroll, agents see noise.",
    impact: "A site that looks great to humans can be completely blank to agents.",
  },
  {
    key: "robots_txt", label: "robots.txt AI rules", weight: 10, icon: "⬡",
    why: "GPTBot, ClaudeBot, and Googleother all read robots.txt before crawling. Explicit allow rules signal you actively want AI traffic; silence is treated as ambiguity.",
    impact: "Some agents opt out of ambiguous sites entirely.",
  },
  {
    key: "sitemap", label: "sitemap.xml", weight: 10, icon: "◳",
    why: "A sitemap gives agents a deterministic list of canonical pages. Without it, agents crawl by following links — missing deep content and paginated sections.",
    impact: "Agents with sitemaps index significantly more deep content.",
  },
  {
    key: "opengraph", label: "OpenGraph tags", weight: 10, icon: "◫",
    why: "og:title and og:description are extracted by retrieval systems when displaying source citations. They define how your content appears in agent responses.",
    impact: "No OG tags → agents cite your page without context, reducing trust.",
  },
  {
    key: "meta", label: "Title + meta description", weight: 10, icon: "≡",
    why: "The title and description are the first text an agent reads. They anchor the page's purpose and determine whether it gets retrieved for a query.",
    impact: "Missing or generic titles cause agents to misclassify your content topic.",
  },
  {
    key: "canonical", label: "Canonical URL", weight: 5, icon: "⊙",
    why: "Agents deduplicate content by canonical URL. Without a canonical tag, the same article at multiple paths gets indexed multiple times — diluting signal and wasting crawl budget.",
    impact: "A silent killer: duplicate content suppresses ranking in agent retrieval.",
  },
];

const BEFORE_AFTER = [
  {
    label: "Before — unoptimised",
    domain: "blog-example.com",
    score: 20,
    grade: "Poor",
    quote: "Our traffic from AI-driven referrals was near zero. We had no /llms.txt, no structured data, and our JS-heavy template couldn't be read by agent crawlers.",
    checks: [
      { key: "llms_txt", pass: false },
      { key: "json_ld", pass: false },
      { key: "clean_content", pass: false },
      { key: "robots_txt", pass: false },
      { key: "sitemap", pass: false },
      { key: "opengraph", pass: true },
      { key: "meta", pass: true },
      { key: "canonical", pass: false },
    ],
  },
  {
    label: "After — fully optimised",
    domain: "stripe.com",
    score: 90,
    grade: "Excellent",
    quote: "Stripe's developer docs have always been machine-readable by design. The /llms.txt was a natural extension of their existing technical documentation culture.",
    checks: [
      { key: "llms_txt", pass: true },
      { key: "json_ld", pass: true },
      { key: "clean_content", pass: true },
      { key: "robots_txt", pass: false },
      { key: "sitemap", pass: true },
      { key: "opengraph", pass: true },
      { key: "meta", pass: true },
      { key: "canonical", pass: true },
    ],
  },
];

const CHECK_SHORT: Record<string, string> = {
  llms_txt: "/llms.txt", robots_txt: "robots.txt", sitemap: "sitemap.xml",
  json_ld: "JSON-LD", opengraph: "OpenGraph", meta: "Title+meta",
  canonical: "Canonical", clean_content: "Clean content",
};

export default async function WhyPage() {
  const stats = await fetchStats();

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const sortedRates = Object.entries(stats.check_pass_rates)
    .sort((a, b) => a[1] - b[1]);

  const topGrade = Object.entries(stats.grade_distribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const worstCheck = sortedRates[0];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em]"
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
            Why It Matters
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          {today}
        </span>
      </div>

      {/* ── SECTION 1: LIVE STATS ── */}
      <div className="pb-12" style={{ borderBottom: "1px solid var(--text)" }}>
        <h1
          className="text-5xl sm:text-6xl font-normal leading-[0.92] tracking-[-0.04em] m-0"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          {stats.total_scans > 0 ? stats.total_scans.toLocaleString() : "Most"} sites
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>aren&apos;t ready.</em>
        </h1>
        <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {stats.total_scans > 0
            ? `Real data from ${stats.total_scans.toLocaleString()} public scans. Updated hourly.`
            : "AI agents read the web differently. Most sites fail every check."}
        </p>

        {/* 3 stat cards */}
        {stats.total_scans > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-0" style={{ border: "1px solid var(--border)" }}>
            {[
              { label: "Total scans", value: stats.total_scans.toLocaleString(), color: "var(--text)" },
              { label: "Avg score", value: `${stats.avg_score} / 100`, color: "var(--blue)" },
              { label: "Most common grade", value: topGrade, color: gradeColor(topGrade) },
            ].map(({ label, value, color }, i) => (
              <div
                key={label}
                className="px-4 py-4 text-center"
                style={{ borderRight: i < 2 ? "1px solid var(--border)" : "none" }}
              >
                <div className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "var(--text-muted)" }}>
                  {label}
                </div>
                <div className="text-lg font-bold tabular-nums" style={{ color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Per-check pass rate bars */}
        {stats.total_scans > 0 && (
          <div className="mt-8">
            <div
              className="text-[10px] uppercase tracking-[0.2em] pb-3 mb-2"
              style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
            >
              Pass rate per check — sorted by most failed
            </div>
            {sortedRates.map(([key, rate]) => (
              <div key={key} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px dotted var(--border)" }}>
                <span className="text-[11px] w-36 shrink-0" style={{ color: "var(--text-muted)" }}>
                  {CHECK_SHORT[key] ?? key}
                </span>
                <div className="flex-1 h-1.5" style={{ background: "var(--border)" }}>
                  <div
                    style={{
                      width: `${rate}%`,
                      height: "100%",
                      background: barColor(rate),
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <span
                  className="text-[11px] tabular-nums w-12 text-right shrink-0"
                  style={{ color: barColor(rate) }}
                >
                  {rate}%
                </span>
              </div>
            ))}
            {worstCheck && (
              <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--red)" }}>{Math.round(100 - worstCheck[1])}% of sites</span> miss{" "}
                {CHECK_SHORT[worstCheck[0]]} — the most commonly failed check.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 2: WHY EACH CHECK MATTERS ── */}
      <div className="py-12" style={{ borderBottom: "1px solid var(--text)" }}>
        <h2
          className="text-4xl sm:text-5xl font-normal leading-[0.92] tracking-[-0.04em] mb-3"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          Eight checks.
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>Each one a signal.</em>
        </h2>
        <p className="mt-4 mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
          AI agents don&apos;t browse — they parse. Here&apos;s what each check detects and why it matters.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0" style={{ border: "1px solid var(--border)" }}>
          {CHECK_EXPLANATIONS.map((item, i) => {
            const rate = stats.check_pass_rates[item.key];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const totalRows = Math.ceil(CHECK_EXPLANATIONS.length / 2);
            return (
              <div
                key={item.key}
                className="p-5 flex flex-col gap-3"
                style={{
                  borderRight: col === 0 ? "1px solid var(--border)" : "none",
                  borderBottom: row < totalRows - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 flex items-center justify-center text-[11px] shrink-0"
                      style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-border)", color: "var(--blue)" }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 shrink-0"
                    style={{ color: "var(--amber)", border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}
                  >
                    +{item.weight} pts
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.why}
                </p>

                <div
                  className="text-[11px] leading-relaxed pl-3"
                  style={{ color: "var(--text-muted)", borderLeft: "2px solid var(--blue-border)" }}
                >
                  {item.impact}
                </div>

                {stats.total_scans > 0 && rate !== undefined && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1" style={{ background: "var(--border)" }}>
                      <div style={{ width: `${rate}%`, height: "100%", background: barColor(rate) }} />
                    </div>
                    <span className="text-[10px] tabular-nums" style={{ color: barColor(rate) }}>
                      {rate}% pass
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: BEFORE / AFTER ── */}
      <div className="py-12">
        <h2
          className="text-4xl sm:text-5xl font-normal leading-[0.92] tracking-[-0.04em] mb-3"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          The difference
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>is visible.</em>
        </h2>
        <p className="mt-4 mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
          Two domains. Same web. Completely different results for AI agents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0" style={{ border: "1px solid var(--border)" }}>
          {BEFORE_AFTER.map((example, i) => {
            const scoreColor = example.score >= 70 ? "var(--blue)" : example.score >= 40 ? "var(--amber)" : "var(--red)";
            return (
              <div
                key={example.domain}
                className="p-5 flex flex-col gap-4"
                style={{ borderRight: i === 0 ? "1px solid var(--border)" : "none" }}
              >
                {/* Label */}
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                  {example.label}
                </div>

                {/* Domain + score */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {example.domain}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
                      {example.score}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 font-bold"
                      style={{
                        color: scoreColor,
                        background: `color-mix(in srgb, ${scoreColor} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${scoreColor} 30%, transparent)`,
                      }}
                    >
                      {example.grade}
                    </span>
                  </div>
                </div>

                {/* Check grid */}
                <div className="grid grid-cols-2 gap-1">
                  {example.checks.map(({ key, pass }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="text-[10px]" style={{ color: pass ? "var(--green)" : "var(--red)" }}>
                        {pass ? "✓" : "✕"}
                      </span>
                      <span className="text-[10px] truncate" style={{ color: pass ? "var(--text-muted)" : "var(--text-muted)", opacity: pass ? 1 : 0.6 }}>
                        {CHECK_SHORT[key]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div
                  className="text-[11px] leading-relaxed italic pl-3"
                  style={{ color: "var(--text-muted)", borderLeft: "2px solid var(--border-bright)" }}
                >
                  &ldquo;{example.quote}&rdquo;
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid var(--text)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            See where your site stands.
          </p>
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.15em] px-5 py-2.5"
            style={{
              background: "var(--blue)",
              color: "var(--bg)",
              textDecoration: "none",
              border: "1px solid var(--blue)",
            }}
          >
            Scan your site →
          </Link>
        </div>
      </div>
    </div>
  );
}
