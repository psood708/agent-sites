import Scanner from "@/components/Scanner";

type SearchParams = Promise<{ url?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { url } = await searchParams;
  return (
    <main className="flex-1">
      <Scanner initialUrl={url} />
    </main>
  );
}
