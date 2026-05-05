interface Recommendation {
  label: string;
  weight: number;
}

interface Props {
  recommendations: Recommendation[];
}

export default function RecommendationsPanel({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <div
        className="fade-up-2 rounded-sm p-6 text-center"
        style={{
          border: "1px solid rgba(0,255,136,0.3)",
          background: "var(--green-dim)",
        }}
      >
        <div
          className="text-sm uppercase tracking-widest"
          style={{ color: "var(--green)" }}
        >
          ✓ All checks passed
        </div>
      </div>
    );
  }

  return (
    <div
      className="fade-up-2 rounded-sm overflow-hidden"
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
        Recommendations · highest impact first
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {recommendations.map(({ label, weight }, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 group"
            style={{ transition: "background 0.15s" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xs tabular-nums w-3 text-right shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {i + 1}.
              </span>
              <span className="text-sm" style={{ color: "var(--text)" }}>
                {label}
              </span>
            </div>
            <span
              className="text-xs font-bold shrink-0 ml-4"
              style={{ color: "var(--amber)" }}
            >
              +{weight} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
