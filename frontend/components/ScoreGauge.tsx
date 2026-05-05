interface Props {
  score: number;
  grade: string;
}

export default function ScoreGauge({ score, grade }: Props) {
  const color =
    score >= 70 ? "var(--blue)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const dimColor =
    score >= 70
      ? "var(--blue-dim)"
      : score >= 40
      ? "var(--amber-dim)"
      : "var(--red-dim)";
  const borderColor =
    score >= 70
      ? "var(--blue-border)"
      : score >= 40
      ? "rgba(245,158,11,0.3)"
      : "rgba(248,113,113,0.3)";

  return (
    <div
      className="fade-up rounded-sm p-8 text-center"
      style={{
        border: `1px solid ${borderColor}`,
        background: dimColor,
        boxShadow: `0 0 60px ${dimColor}`,
      }}
    >
      <div
        className="text-8xl font-bold tracking-tighter"
        style={{ color, fontVariantNumeric: "tabular-nums" }}
      >
        {score}
        <span
          className="text-3xl font-light ml-2"
          style={{ color: "var(--text-muted)" }}
        >
          / 100
        </span>
      </div>
      <div
        className="mt-3 text-sm font-bold uppercase tracking-[0.25em]"
        style={{ color }}
      >
        {grade}
      </div>
      <div
        className="mt-2 text-xs uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Agent Readiness Score
      </div>
    </div>
  );
}
