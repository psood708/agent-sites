import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In — AgentReadiness",
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em]"
        style={{ color: "var(--text-muted)", textDecoration: "none" }}
      >
        <span style={{ color: "var(--blue)" }}>←</span>
        Back
      </Link>

      <div
        className="pb-3 mb-8"
        style={{ borderBottom: "1px solid var(--text)" }}
      >
        <div className="flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
          <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text)" }}>
            Sign In
          </span>
        </div>
      </div>

      <h1
        className="text-5xl font-normal leading-[0.92] tracking-[-0.04em] m-0"
        style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
      >
        Welcome
        <br />
        <em style={{ fontStyle: "italic", color: "var(--blue)" }}>back.</em>
      </h1>
      <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Enter your email and we&apos;ll send you a magic link — no password needed.
      </p>

      <SignInForm />
    </div>
  );
}
