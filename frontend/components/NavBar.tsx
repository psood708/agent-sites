"use client";

import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = ["Report", "API", "Pricing"];

export default function NavBar() {
  return (
    <nav
      className="flex items-center justify-between px-6 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-[22px] h-[22px] flex items-center justify-center shrink-0"
          style={{ border: "1px solid var(--blue)", background: "var(--blue-dim)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--blue)" }} />
        </div>
        <span
          className="text-[12px] uppercase tracking-[0.2em] font-medium"
          style={{ color: "var(--text)" }}
        >
          agentreadiness
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-5 text-[11px] uppercase tracking-[0.15em]">
          {NAV_LINKS.map((label) => (
            <span
              key={label}
              className="cursor-pointer transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-muted)")
              }
            >
              {label}
            </span>
          ))}
        </div>
        <button
          className="hidden sm:block text-[11px] uppercase tracking-[0.15em] px-3 py-1.5"
          style={{
            border: "1px solid var(--border-bright)",
            color: "var(--text-muted)",
            background: "transparent",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--blue-border)";
            (e.currentTarget as HTMLElement).style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border-bright)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          Sign in
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
