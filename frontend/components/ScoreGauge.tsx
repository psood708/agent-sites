interface Props {
  score: number;
  grade: string;
}

export default function ScoreGauge({ score, grade }: Props) {
  const color =
    score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const dimColor =
    score >= 70
      ? "var(--green-dim)"
      : score >= 40
      ? "var(--amber-dim)"
      : "var(--red-dim)";

  return (
    <div
      className="fade-up rounded-sm p-8 text-center"
      style={{
        border: `1px solid ${color}`,
        background: dimColor,
        boxShadow: `0 0 40px ${dimColor}`,
      }}
    >
      <div
        className="text-7xl font-bold tracking-tighter tabular-nums"
        style={{ color, fontVariantNumeric: "tabular-nums" }}
      >
        {score}
        <span
          className="text-3xl font-light ml-1"
          style={{ color: "var(--text-muted)" }}
        >
          / 100
        </span>
      </div>
      <div
        className="mt-3 text-sm font-medium uppercase tracking-[0.2em]"
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
