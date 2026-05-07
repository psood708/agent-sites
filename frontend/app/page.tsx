import Scanner from "@/components/Scanner";

type SearchParams = Promise<{ url?: string }>;

interface StatsData {
  total_scans: number;
  avg_score: number;
  grade_distribution: Record<string, number>;
  check_pass_rates: Record<string, number>;
}

async function fetchStats(): Promise<StatsData> {
  const empty: StatsData = {
    total_scans: 0,
    avg_score: 0,
    grade_distribution: { Excellent: 0, Good: 0, "Needs work": 0, Poor: 0 },
    check_pass_rates: {
      llms_txt: 0, robots_txt: 0, sitemap: 0, json_ld: 0,
      opengraph: 0, meta: 0, canonical: 0, clean_content: 0,
    },
  };
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${apiUrl}/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { url } = await searchParams;
  const stats = await fetchStats();
  return (
    <main className="flex-1">
      <Scanner initialUrl={url} stats={stats} />
    </main>
  );
}
