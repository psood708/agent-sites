"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Report", href: "/reports" },
  { label: "API", href: "/api-docs" },
  { label: "Pricing", href: "/pricing" },
];

export default function NavBar({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      <nav
        className="flex items-center justify-between px-6 py-3 relative z-50"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }} className="flex items-center gap-2.5" onClick={close}>
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
        </Link>

        {/* Right — desktop */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-5 text-[11px] uppercase tracking-[0.15em]">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors"
                style={{
                  color: pathname === href ? "var(--text)" : "var(--text-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    pathname === href ? "var(--text)" : "var(--text-muted)")
                }
              >
                {label}
              </Link>
            ))}
          </div>
          {userEmail ? (
            <div className="hidden sm:flex items-center gap-3">
              <span
                className="text-[11px] uppercase tracking-[0.1em] max-w-[140px] truncate"
                style={{ color: "var(--text-muted)" }}
                title={userEmail}
              >
                {userEmail}
              </span>
              <button
                onClick={signOut}
                className="text-[11px] uppercase tracking-[0.15em] px-3 py-1.5"
                style={{
                  border: "1px solid var(--border-bright)",
                  color: "var(--text-muted)",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="hidden sm:block text-[11px] uppercase tracking-[0.15em] px-3 py-1.5"
              style={{
                border: "1px solid var(--border-bright)",
                color: "var(--text-muted)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              Sign in
            </Link>
          )}
          <ThemeToggle />

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <span
              style={{
                display: "block",
                width: "18px",
                height: "1px",
                background: "var(--text)",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform: open ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "18px",
                height: "1px",
                background: "var(--text)",
                transition: "opacity 0.2s ease",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: "18px",
                height: "1px",
                background: "var(--text)",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={close}
        >
          <div
            className="absolute top-0 right-0 h-full w-64 flex flex-col"
            style={{
              background: "var(--bg-card)",
              borderLeft: "1px solid var(--border-bright)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "var(--text-muted)" }}
              >
                Menu
              </span>
              <button
                onClick={close}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col py-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={close}
                  className="px-5 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-colors"
                  style={{
                    color: pathname === href ? "var(--text)" : "var(--text-muted)",
                    textDecoration: "none",
                    borderLeft: pathname === href ? "2px solid var(--blue)" : "2px solid transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign in / Sign out */}
            <div
              className="px-5 py-4 mt-auto"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {userEmail ? (
                <div className="flex flex-col gap-2">
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {userEmail}
                  </span>
                  <button
                    onClick={() => { close(); signOut(); }}
                    className="block w-full py-2.5 text-center text-[11px] uppercase tracking-[0.15em]"
                    style={{
                      border: "1px solid var(--border-bright)",
                      color: "var(--text-muted)",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={close}
                  className="block w-full py-2.5 text-center text-[11px] uppercase tracking-[0.15em]"
                  style={{
                    border: "1px solid var(--blue-border)",
                    color: "var(--blue)",
                    textDecoration: "none",
                    background: "var(--blue-dim)",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
