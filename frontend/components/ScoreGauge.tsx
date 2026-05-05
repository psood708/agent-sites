interface Props {
  score: number;
  grade: string;
  domain?: string;
}

const DIST = [2, 4, 7, 11, 14, 16, 14, 12, 10, 6, 3, 1];
const DIST_MAX = Math.max(...DIST);

function headline(score: number): [string, string, string] {
  if (score >= 80) return ["A site that is", "fully prepared", "for AI agents."];
  if (score >= 60) return ["A site that is", "mostly readable", "to AI agents."];
  if (score >= 40) return ["A site that", "needs work", "for AI agents."];
  return ["A site that is", "largely invisible", "to AI agents."];
}

export default function ScoreGauge({ score, grade, domain }: Props) {
  const color =
    score >= 70 ? "var(--blue)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const bucket = Math.min(Math.floor(score / 10), 11);
  const percentile = DIST.slice(0, bucket + 1).reduce((a, b) => a + b, 0);
  const [pre, em, post] = headline(score);

  const today = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="fade-up">
      {/* Header rail */}
      <div
        className="flex justify-between items-center pb-3 mb-8"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        <div className="flex gap-2.5 items-center">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--blue)" }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text)" }}
          >
            Agent Readiness Report
          </span>
        </div>
        <div
          className="text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--text-muted)" }}
        >
          {domain && `${domain} · `}
          {today}
        </div>
      </div>

      {/* Headline */}
      <div className="pb-10" style={{ borderBottom: "1px solid var(--text)" }}>
        {domain && (
          <div
            className="text-[11px] uppercase tracking-[0.25em] mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            The Subject — {domain}
          </div>
        )}
        <h1
          className="text-5xl sm:text-6xl font-normal leading-[0.92] tracking-[-0.04em] m-0"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            color: "var(--text)",
          }}
        >
          {pre}
          <br />
          <em style={{ fontStyle: "italic", color }}>{em}</em>
          <br />
          {post}
        </h1>
        <p
          className="mt-5 text-sm max-w-md leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Scanned across 8 weighted criteria.{" "}
          {domain ? `${domain} scored` : "Scored"}{" "}
          {score >= 60 ? "above" : "below"} the median public site. Full
          receipt below.
        </p>
      </div>

      {/* Score + histogram */}
      <div
        className="pt-6 pb-6 grid grid-cols-2 gap-12"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        {/* Left: big number */}
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.25em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            The Score
          </div>
          <div
            className="font-normal leading-none tracking-[-0.06em]"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "clamp(80px, 14vw, 160px)",
              color,
            }}
          >
            {score}
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-base" style={{ color: "var(--text-muted)" }}>
              out of 100
            </span>
            <span
              className="text-[11px] uppercase tracking-[0.2em] px-2 py-0.5"
              style={{ color, border: `1px solid ${color}` }}
            >
              {grade}
            </span>
          </div>
        </div>

        {/* Right: histogram */}
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.25em] mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Where you sit
          </div>
          <div
            className="flex items-end gap-0.5 h-24"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {DIST.map((d, i) => (
              <div
                key={i}
                className="flex-1 relative"
                style={{
                  height: `${(d / DIST_MAX) * 100}%`,
                  background: i === bucket ? color : "var(--border-bright)",
                }}
              >
                {i === bucket && (
                  <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap font-medium"
                    style={{ color }}
                  >
                    ▼ you
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className="flex justify-between mt-1.5 text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Better than{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {percentile}%
            </span>{" "}
            of public sites scanned. Top decile sits at 88+.
          </p>
        </div>
      </div>
    </div>
  );
}
