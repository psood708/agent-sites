"use client";

import { useState } from "react";

const FEATURES: [string, string | boolean, string | boolean, string | boolean][] = [
  ["Public scans",          "15 / day",    "Unlimited",   "Unlimited"],
  ["Score + grade (0–100)", true,          true,          true],
  ["/llms.txt draft",       true,          true,          true],
  ["Shareable score card",  true,          true,          true],
  ["Score history",         false,         "90 days",     "Unlimited"],
  ["Domain verification",   false,         "3 domains",   "20 domains"],
  ["Score drop alerts",     false,         true,          true],
  ["Weekly email digest",   false,         true,          true],
  ["Rescan on demand",      false,         true,          true],
  ["Private / staging scans", false,       true,          true],
  ["Shadow layer hosting",  false,         false,         true],
  ["/llms.txt editor",      false,         false,         true],
  ["Agent hit analytics",   false,         false,         true],
  ["REST API",              false,         false,         true],
  ["GitHub Action",         false,         false,         true],
  ["Slack / webhooks",      false,         false,         true],
  ["Team seats",            false,         "1",           "5"],
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return <span style={{ color: "var(--green)", fontSize: "13px" }}>✓</span>;
  if (value === false)
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  return <span style={{ color: "var(--text)", fontSize: "12px" }}>{value}</span>;
}

function CheckoutButton({ plan, children, primary }: { plan: string; children: React.ReactNode; primary?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout not configured yet — check back soon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-2.5 text-[11px] uppercase tracking-[0.15em] font-medium transition-all disabled:opacity-40"
      style={{
        background: primary ? "var(--blue)" : "transparent",
        color: primary ? "var(--bg)" : "var(--text-muted)",
        border: primary ? "1px solid var(--blue)" : "1px solid var(--border-bright)",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}

export default function PricingClient() {
  const [annual, setAnnual] = useState(false);

  const tiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      annualPrice: 0,
      sub: "forever",
      job: "Diagnose. See how your site looks to AI agents.",
      cta: null,
      highlight: false,
    },
    {
      id: "base",
      name: "Base",
      price: 19,
      annualPrice: 16,
      annualTotal: 190,
      sub: "/ month",
      job: "Monitor. Get alerted the moment your score drops.",
      cta: "base",
      highlight: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 79,
      annualPrice: 66,
      annualTotal: 790,
      sub: "/ month",
      job: "Optimise. Host agent-ready content and prove it works.",
      cta: "pro",
      highlight: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="pb-10" style={{ borderBottom: "1px solid var(--text)" }}>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
          Pricing
        </span>
        <h1
          className="text-5xl sm:text-6xl font-normal leading-[0.92] tracking-[-0.04em] mt-3"
          style={{ fontFamily: "'Times New Roman', Times, serif", color: "var(--text)" }}
        >
          Three tiers.
          <br />
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>One job each.</em>
        </h1>
        <p className="mt-5 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
          Free scanner forever. Pay only when you need monitoring or active optimisation.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 mt-8">
          <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: annual ? "var(--text-muted)" : "var(--text)" }}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-10 h-5 transition-colors"
            style={{
              background: annual ? "var(--blue)" : "var(--border-bright)",
              border: "none",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 transition-all"
              style={{
                left: annual ? "calc(100% - 18px)" : "2px",
                background: annual ? "var(--bg)" : "var(--text-muted)",
                borderRadius: "1px",
              }}
            />
          </button>
          <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: annual ? "var(--text)" : "var(--text-muted)" }}>
            Annual
          </span>
          {annual && (
            <span
              className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5"
              style={{
                color: "var(--green)",
                border: "1px solid rgba(74,222,128,0.3)",
                background: "var(--green-dim)",
              }}
            >
              Save ~17%
            </span>
          )}
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 mt-10"
        style={{ border: "1px solid var(--border)" }}>
        {tiers.map((tier, i) => (
          <div
            key={tier.id}
            className="p-6 flex flex-col gap-5"
            style={{
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
              background: tier.highlight ? "var(--bg-card)" : "transparent",
              position: "relative",
            }}
          >
            {tier.highlight && (
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "var(--blue)" }}
              />
            )}

            <div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: tier.highlight ? "var(--blue)" : "var(--text-muted)" }}
                >
                  {tier.name}
                </span>
                {tier.highlight && (
                  <span
                    className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5"
                    style={{
                      color: "var(--blue)",
                      border: "1px solid var(--blue-border)",
                      background: "var(--blue-dim)",
                    }}
                  >
                    Recommended
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span
                  className="text-4xl font-bold tabular-nums tracking-[-0.04em]"
                  style={{ color: "var(--text)" }}
                >
                  ${tier.price === 0 ? "0" : annual && "annualPrice" in tier ? tier.annualPrice : tier.price}
                </span>
                {tier.price > 0 && (
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {annual ? "/ month, billed annually" : tier.sub}
                  </span>
                )}
                {tier.price === 0 && (
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{tier.sub}</span>
                )}
              </div>
              {annual && tier.price > 0 && "annualTotal" in tier && (
                <div className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  ${tier.annualTotal} billed once a year
                </div>
              )}

              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {tier.job}
              </p>
            </div>

            {tier.cta ? (
              <CheckoutButton plan={tier.cta} primary={tier.highlight}>
                Get started →
              </CheckoutButton>
            ) : (
              <a
                href="/"
                className="w-full py-2.5 text-[11px] uppercase tracking-[0.15em] text-center transition-all"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-bright)",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                Start scanning →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="mt-14">
        <div
          className="text-[10px] uppercase tracking-[0.25em] pb-3"
          style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
        >
          Full feature comparison
        </div>

        {/* Table header */}
        <div
          className="grid text-[10px] uppercase tracking-[0.2em] py-3"
          style={{
            gridTemplateColumns: "1fr 80px 80px 80px",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span>Feature</span>
          <span className="text-center">Free</span>
          <span className="text-center">Base</span>
          <span className="text-center">Pro</span>
        </div>

        {FEATURES.map(([label, free, base, pro], i) => (
          <div
            key={i}
            className="grid items-center py-2.5"
            style={{
              gridTemplateColumns: "1fr 80px 80px 80px",
              borderBottom: "1px dotted var(--border)",
            }}
          >
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{label}</span>
            <span className="text-center"><Cell value={free} /></span>
            <span className="text-center"><Cell value={base} /></span>
            <span className="text-center"><Cell value={pro} /></span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div
        className="flex flex-col sm:flex-row justify-between gap-3 mt-10 pt-6 text-[11px]"
        style={{ borderTop: "1px solid var(--text)", color: "var(--text-muted)" }}
      >
        <span>All plans include full 8-check scoring. No credit card required for Free.</span>
        <a href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>← Back to scanner</a>
      </div>
    </div>
  );
}
