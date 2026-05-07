"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    id: "role",
    text: "What best describes you?",
    options: [
      "Indie dev / solo founder",
      "Developer at a startup",
      "Dev-tools / DevEx engineer",
      "Content / marketing manager",
      "Agency owner",
      "Other",
    ],
  },
  {
    id: "pain",
    text: "What's your biggest concern about AI agent discovery?",
    options: [
      "I don't know how AI agents see my site",
      "My site isn't showing up in AI answers",
      "I have no way to monitor regressions",
      "My competitors appear and I don't",
      "I don't know what /llms.txt even is yet",
    ],
  },
  {
    id: "current",
    text: "What tools do you currently use for this?",
    options: [
      "Nothing — this is new to me",
      "Manual checks (curl, browser)",
      "SEO tools (Semrush, Ahrefs, etc.)",
      "I wrote something custom",
      "Other",
    ],
  },
  {
    id: "value",
    text: "Which feature would make you pay immediately?",
    options: [
      "Score drop alerts",
      "90-day score history",
      "Shadow layer hosting (agent-ready content CDN)",
      "Agent hit analytics (which bots, how often)",
      "GitHub Action to fail deploys on score regression",
    ],
  },
  {
    id: "tier",
    text: "Which plan would you realistically use?",
    options: [
      "Free only — scanner is enough for now",
      "Base ($19/mo) — monitoring + alerts",
      "Pro ($79/mo) — shadow layer + analytics + API",
      "Depends on what the trial looks like",
    ],
  },
];

const CONTACT_EMAIL = "parthsood99@gmail.com";

export default function SurveySection() {
  const [step, setStep] = useState<"survey" | "wishlist" | "done">("survey");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = QUESTIONS[qIndex];

  function pickAnswer(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setStep("wishlist");
    }
  }

  async function submitWishlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers }),
      });
      if (!res.ok) throw new Error("Failed to join");
      setStep("done");
    } catch {
      setError("Something went wrong. Try emailing directly.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((qIndex + (step === "wishlist" || step === "done" ? QUESTIONS.length : 0)) / QUESTIONS.length) * 100;

  return (
    <section
      className="w-full max-w-5xl mx-auto px-4 pb-16"
      id="survey"
    >
      {/* Header */}
      <div
        className="mb-12 pt-16 pb-12"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          Market Survey
        </span>
        <h2
          className="text-3xl sm:text-4xl font-normal leading-[0.95] tracking-[-0.03em] mt-3"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            color: "var(--text)",
          }}
        >
          Help shape what we build.
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>
            Takes 60 seconds.
          </em>
        </h2>
        <p className="mt-3 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
          5 questions. No account needed. Your answers directly influence which features ship next.
        </p>
      </div>

      {/* Survey card */}
      <div
        className="max-w-xl"
        style={{
          border: "1px solid var(--border-bright)",
          background: "var(--bg-card)",
        }}
      >
        {/* Progress bar */}
        <div style={{ background: "var(--border)", height: "2px" }}>
          <div
            style={{
              width: `${progress}%`,
              background: "var(--blue)",
              height: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {step === "survey" && (
            <div>
              <div
                className="text-[10px] uppercase tracking-[0.2em] mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {qIndex + 1} / {QUESTIONS.length}
              </div>
              <p
                className="text-[15px] font-medium mb-5 leading-snug"
                style={{ color: "var(--text)" }}
              >
                {current.text}
              </p>
              <div className="flex flex-col gap-2">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pickAnswer(opt)}
                    className="text-left px-4 py-3 text-[13px] transition-all"
                    style={{
                      border: "1px solid var(--border-bright)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-border)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text)";
                      (e.currentTarget as HTMLElement).style.background = "var(--blue-dim)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "wishlist" && (
            <form onSubmit={submitWishlist}>
              <div
                className="text-[10px] uppercase tracking-[0.2em] mb-4"
                style={{ color: "var(--green)" }}
              >
                Done — 5 / 5
              </div>
              <p
                className="text-[15px] font-medium mb-2 leading-snug"
                style={{ color: "var(--text)" }}
              >
                Join the wishlist.
              </p>
              <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
                Be first to know when Base launches. No spam — one email when the product goes live.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-[13px] outline-none"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-bright)",
                    color: "var(--text)",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLElement).style.borderColor = "var(--blue-border)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLElement).style.borderColor = "var(--border-bright)")
                  }
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-medium transition-all disabled:opacity-40"
                  style={{
                    background: "var(--blue)",
                    color: "var(--bg)",
                    border: "1px solid var(--blue)",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {submitting ? "Joining…" : "Join wishlist →"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-[12px]" style={{ color: "var(--red)" }}>
                  {error}{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    style={{ color: "var(--blue)", textDecoration: "underline" }}
                  >
                    Email us directly
                  </a>
                </p>
              )}
            </form>
          )}

          {step === "done" && (
            <div>
              <div
                className="text-[10px] uppercase tracking-[0.2em] mb-4"
                style={{ color: "var(--green)" }}
              >
                ✓ You're on the list
              </div>
              <p
                className="text-[15px] font-medium mb-2"
                style={{ color: "var(--text)" }}
              >
                Thanks — we'll reach out when Base launches.
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Your answers help us prioritise. Expect one email, no newsletters.
              </p>
            </div>
          )}
        </div>

        {/* Contact footer */}
        <div
          className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Specific questions or a custom requirement?
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=AgentReadiness%20enquiry`}
            className="text-[11px] uppercase tracking-[0.15em] transition-colors"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Email us →
          </a>
        </div>
      </div>
    </section>
  );
}
