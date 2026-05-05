import type { Metadata } from "next";
import Link from "next/link";

type SearchParams = Promise<{
  url?: string;
  score?: string;
  grade?: string;
  passing?: string;
  total?: string;
  passing_keys?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const domain = params.url ?? "unknown";
  const score = params.score ?? "0";
  const grade = params.grade ?? "Unknown";
  const passing = params.passing ?? "0";
  const total = params.total ?? "8";
  const passingKeys = params.passing_keys ?? "";

  const ogImageUrl =
    `/api/og?url=${encodeURIComponent(domain)}` +
    `&score=${score}` +
    `&grade=${encodeURIComponent(grade)}` +
    `&passing=${passing}` +
    `&total=${total}` +
    `&passing_keys=${encodeURIComponent(passingKeys)}`;

  const title = `${domain} scored ${score}/100 for AI agent readiness`;
  const description = `${grade} — ${passing}/${total} checks passing. AI crawlers are the new Googlebot. Score your site.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ScorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const domain = params.url ?? "";
  const score = parseInt(params.score ?? "0", 10);
  const grade = params.grade ?? "Unknown";
  const passing = parseInt(params.passing ?? "0", 10);
  const total = parseInt(params.total ?? "8", 10);
  const passingKeys = new Set(
    (params.passing_keys ?? "").split(",").filter(Boolean)
  );

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

  const CHECK_LABELS: Record<string, string> = {
    llms_txt: "/llms.txt",
    json_ld: "JSON-LD",
    clean_content: "Content",
    opengraph: "OpenGraph",
    meta: "Meta tags",
    canonical: "Canonical",
    robots_txt: "robots.txt",
    sitemap: "sitemap.xml",
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      {/* Score card */}
      <div
        className="rounded-sm overflow-hidden mb-8"
        style={{
          border: `1px solid ${scoreBorder}`,
          background: "var(--bg-card)",
          boxShadow: `0 0 80px ${scoreDim}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: "var(--blue)" }}
          >
            agentreadiness
          </span>
          <span
            className="text-xs px-3 py-1 rounded-sm font-bold uppercase tracking-wider"
            style={{
              color: scoreColor,
              background: scoreDim,
              border: `1px solid ${scoreBorder}`,
            }}
          >
            {grade}
          </span>
        </div>

        {/* Body */}
        <div className="flex gap-0">
          {/* Left */}
          <div
            className="flex-1 px-8 py-10"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <div
              className="text-8xl font-bold tracking-tighter leading-none"
              style={{ color: scoreColor }}
            >
              {score}
              <span
                className="text-3xl font-light ml-2"
                style={{ color: "var(--text-muted)" }}
              >
                / 100
              </span>
            </div>
            {domain && (
              <div
                className="mt-6 text-lg font-medium"
                style={{ color: "var(--text)" }}
              >
                {domain}
              </div>
            )}
            <div className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {passing} of {total} checks passing
            </div>
          </div>

          {/* Right: check dots */}
          <div className="px-8 py-10 flex flex-col justify-center gap-3">
            {CHECK_ORDER.map((key) => {
              const pass = passingKeys.has(key);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: pass ? "var(--green)" : "var(--text-muted)",
                      boxShadow: pass ? "0 0 6px var(--green)" : undefined,
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: pass ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {CHECK_LABELS[key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        {domain && (
          <Link
            href={`/?url=${encodeURIComponent(domain)}`}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-sm transition-all"
            style={{
              background: "var(--blue)",
              color: "var(--bg)",
              border: "1px solid var(--blue)",
            }}
          >
            Rescan {domain} →
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center w-full py-3 text-sm font-medium rounded-sm transition-all"
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            border: "1px solid var(--border-bright)",
          }}
        >
          Score your own site
        </Link>
      </div>

      {/* Shared context */}
      <p
        className="mt-8 text-xs text-center"
        style={{ color: "var(--text-muted)" }}
      >
        This score was captured at the time of scanning. Results may vary.
      </p>
    </div>
  );
}
