"use client";

import { useState } from "react";

interface Props {
  content: string;
  domain: string;
}

export default function LlmsTxtPanel({ content, domain }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fade-up-3 rounded-sm overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Draft /llms.txt
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {domain}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-sm transition-all cursor-pointer"
            style={{
              color: copied ? "var(--green)" : "var(--text-muted)",
              border: `1px solid ${copied ? "rgba(0,255,136,0.4)" : "var(--border)"}`,
              background: copied ? "var(--green-dim)" : "transparent",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1 rounded-sm transition-all cursor-pointer"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-bright)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
            }}
          >
            Download
          </button>
        </div>
      </div>
      <pre
        className="p-4 text-xs leading-relaxed overflow-x-auto"
        style={{ color: "var(--text)", background: "var(--bg-card)" }}
      >
        {content}
      </pre>
      <div
        className="px-4 py-2 text-xs"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        Save this file to your domain root at{" "}
        <span style={{ color: "var(--text)" }}>{domain}/llms.txt</span>
      </div>
    </div>
  );
}
