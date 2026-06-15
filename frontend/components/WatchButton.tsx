"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  url: string;
  score: number;
  initialWatching: boolean;
}

export default function WatchButton({ url, score, initialWatching }: Props) {
  const [watching, setWatching] = useState(initialWatching);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

      if (watching) {
        await fetch(`${apiUrl}/watch?url=${encodeURIComponent(url)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setWatching(false);
      } else {
        await fetch(`${apiUrl}/watch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url, score }),
        });
        setWatching(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-[10px] uppercase tracking-[0.12em] px-2 py-1 shrink-0 disabled:opacity-40"
      style={{
        border: `1px solid ${watching ? "var(--blue-border)" : "var(--border)"}`,
        color: watching ? "var(--blue)" : "var(--text-muted)",
        background: watching ? "var(--blue-dim)" : "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
      title={watching ? "Stop watching this site" : "Watch for score drops"}
    >
      {watching ? "Watching ✓" : "Watch"}
    </button>
  );
}
