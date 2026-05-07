"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="mt-10">
        <div
          className="px-5 py-4 text-sm"
          style={{ border: "1px solid var(--blue-border)", background: "var(--blue-dim)" }}
        >
          <p style={{ color: "var(--blue)" }} className="text-[11px] uppercase tracking-[0.15em] mb-1">
            Check your email
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            We sent a magic link to <span style={{ color: "var(--text)" }}>{email}</span>.
            Click it to sign in — no password needed.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="mt-4 text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="email"
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--text-muted)" }}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="px-3 py-2.5 text-sm w-full"
          style={{
            background: "transparent",
            border: "1px solid var(--border-bright)",
            color: "var(--text)",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue-border)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
        />
        {error && (
          <p className="text-[11px]" style={{ color: "var(--red)" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          className="px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] transition-opacity"
          style={{
            background: "var(--blue)",
            color: "#fff",
            border: "none",
            cursor: loading || !email ? "not-allowed" : "pointer",
            opacity: loading || !email ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
      </div>
    </form>
  );
}
