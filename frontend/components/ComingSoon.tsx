import PixelAvatar from "./PixelAvatar";

interface Props {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-10 text-center">
      <span
        className="text-[10px] uppercase tracking-[0.35em]"
        style={{ color: "var(--text-muted)" }}
      >
        Coming Soon
      </span>

      <PixelAvatar />

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2.5rem", width: "100%" }}>
        <h1
          className="text-5xl font-normal leading-[0.9] tracking-[-0.03em]"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          {title}
        </h1>
        <p className="mt-5 text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>

      <a
        href="/"
        className="text-[11px] uppercase tracking-[0.15em]"
        style={{ color: "var(--blue)", textDecoration: "none" }}
      >
        ← Back to scanner
      </a>
    </div>
  );
}
