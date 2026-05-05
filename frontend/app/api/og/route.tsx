import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CHECK_KEYS = [
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("url") ?? "unknown";
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const grade = searchParams.get("grade") ?? "Unknown";
  const passing = parseInt(searchParams.get("passing") ?? "0", 10);
  const total = parseInt(searchParams.get("total") ?? "8", 10);

  // passing_keys is a comma-separated list of check keys that passed
  const passingKeys = new Set(
    (searchParams.get("passing_keys") ?? "").split(",").filter(Boolean)
  );

  const scoreColor =
    score >= 70 ? "#38bdf8" : score >= 40 ? "#f59e0b" : "#f87171";
  const scoreBg =
    score >= 70
      ? "rgba(56,189,248,0.08)"
      : score >= 40
      ? "rgba(245,158,11,0.08)"
      : "rgba(248,113,113,0.08)";
  const scoreBorder =
    score >= 70
      ? "rgba(56,189,248,0.3)"
      : score >= 40
      ? "rgba(245,158,11,0.3)"
      : "rgba(248,113,113,0.3)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          border: `1px solid ${scoreBorder}`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 48px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#38bdf8",
            }}
          >
            agentreadiness
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 14px",
              background: scoreBg,
              border: `1px solid ${scoreBorder}`,
              borderRadius: "4px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: scoreColor,
              }}
            >
              {grade}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* Left: score + domain */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 64px",
              flex: 1,
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "140px",
                fontWeight: "bold",
                color: scoreColor,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {score}
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: "300",
                  color: "rgba(255,255,255,0.3)",
                  marginLeft: "10px",
                }}
              >
                / 100
              </span>
            </div>
            <div
              style={{
                marginTop: "32px",
                fontSize: "24px",
                color: "rgba(255,255,255,0.9)",
                fontWeight: "500",
              }}
            >
              {domain}
            </div>
            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.05em",
              }}
            >
              {passing} of {total} checks passing
            </div>
          </div>

          {/* Right: check dots */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 64px",
              gap: "18px",
            }}
          >
            {CHECK_KEYS.map((key) => {
              const pass = passingKeys.has(key);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: pass ? "#4ade80" : "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      color: pass
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {CHECK_LABELS[key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 48px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            AI Crawlers are the new Googlebot. Is your site ready?
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
