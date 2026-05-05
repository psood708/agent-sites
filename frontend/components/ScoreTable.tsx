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
  "robots_txt",
  "sitemap",
  "opengraph",
  "meta",
  "canonical",
];

export default function ScoreTable({ checks }: Props) {
  const ordered = CHECK_ORDER.map((k) => ({ key: k, ...checks[k] })).filter(
    Boolean
  );

  return (
    <div
      className="fade-up-1 rounded-sm overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="px-4 py-2 text-xs uppercase tracking-widest"
        style={{
          color: "var(--text-muted)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        Diagnostic Report
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th
              className="text-left px-4 py-2 text-xs uppercase tracking-widest font-normal"
              style={{ color: "var(--text-muted)", width: "40%" }}
            >
              Check
            </th>
            <th
              className="text-right px-4 py-2 text-xs uppercase tracking-widest font-normal"
              style={{ color: "var(--text-muted)", width: "80px" }}
            >
              Points
            </th>
            <th
              className="text-left px-4 py-2 text-xs uppercase tracking-widest font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              Detail
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map(({ key, pass, detail, weight, label }, i) => (
            <tr
              key={key}
              style={{
                borderBottom:
                  i < ordered.length - 1
                    ? "1px solid var(--border)"
                    : undefined,
                background: pass ? "var(--green-dim)" : "transparent",
                transition: "background 0.2s",
              }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: pass ? "var(--green)" : "var(--text-muted)",
                      boxShadow: pass
                        ? "0 0 6px var(--green)"
                        : undefined,
                    }}
                  />
                  <span style={{ color: "var(--text)" }}>{label}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className="font-bold tabular-nums"
                  style={{
                    color: pass ? "var(--green)" : "var(--text-muted)",
                  }}
                >
                  {pass ? `+${weight}` : "0"}
                </span>
              </td>
              <td
                className="px-4 py-3 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider shrink-0"
                    style={{
                      background: pass ? "var(--green-dim)" : "var(--red-dim)",
                      color: pass ? "var(--green)" : "var(--red)",
                      border: `1px solid ${pass ? "rgba(0,255,136,0.2)" : "rgba(248,113,113,0.2)"}`,
                    }}
                  >
                    {pass ? "PASS" : "FAIL"}
                  </span>
                  <span>{detail}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
