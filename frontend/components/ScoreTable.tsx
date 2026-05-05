interface Check {
  pass: boolean;
  detail: string;
  weight: number;
  label: string;
  data: unknown;
}

interface Props {
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

export default function ScoreTable({ checks }: Props) {
  const ordered = CHECK_ORDER.filter((k) => checks[k]);
  const passing = ordered.filter((k) => checks[k].pass);
  const failing = ordered.filter((k) => !checks[k].pass);
  const totalEarned = passing.reduce((s, k) => s + checks[k].weight, 0);
  const totalMissed = failing.reduce((s, k) => s + checks[k].weight, 0);

  return (
    <div className="fade-up-1">
      <div className="grid grid-cols-2 gap-12">
        {/* Credited */}
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.25em] pb-2.5"
            style={{
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            Credited — {passing.length} items
          </div>
          {passing.map((k) => (
            <div
              key={k}
              className="flex justify-between py-2.5"
              style={{ borderBottom: "1px dotted var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--text)" }}>
                ✓ &nbsp;{checks[k].label}
              </span>
              <span
                className="text-sm tabular-nums"
                style={{ color: "var(--green)" }}
              >
                +{checks[k].weight}.00
              </span>
            </div>
          ))}
          <div
            className="flex justify-between py-3 mt-1"
            style={{ borderTop: "1px solid var(--text)" }}
          >
            <span
              className="text-[12px] uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              Subtotal
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: "var(--text)" }}
            >
              +{totalEarned}.00
            </span>
          </div>
        </div>

        {/* Forfeited */}
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.25em] pb-2.5"
            style={{
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            Forfeited — {failing.length} items
          </div>
          {failing.map((k) => (
            <div
              key={k}
              className="flex justify-between py-2.5"
              style={{ borderBottom: "1px dotted var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                ✕ &nbsp;{checks[k].label}
              </span>
              <span
                className="text-sm tabular-nums"
                style={{ color: "var(--red)" }}
              >
                −{checks[k].weight}.00
              </span>
            </div>
          ))}
          <div
            className="flex justify-between py-3 mt-1"
            style={{ borderTop: "1px solid var(--text)" }}
          >
            <span
              className="text-[12px] uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              Available uplift
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: "var(--red)" }}
            >
              +{totalMissed}.00
            </span>
          </div>
        </div>
      </div>

      {/* Foot rule */}
      <div
        className="flex justify-between mt-6 pt-4 text-[11px] uppercase tracking-[0.12em]"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--text)",
        }}
      >
        <span>Methodology · v0.4.2</span>
        <span className="hidden sm:block">
          —— continued: recommendations &amp; /llms.txt draft
        </span>
        <span>p. 01 / 03</span>
      </div>
    </div>
  );
}
