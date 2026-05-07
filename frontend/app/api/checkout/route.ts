export async function POST(req: Request) {
  const { plan } = await req.json();

  const links: Record<string, string | undefined> = {
    base: process.env.DODO_BASE_PAYMENT_LINK,
    pro: process.env.DODO_PRO_PAYMENT_LINK,
  };

  const url = links[plan as string];

  if (!url) {
    return Response.json(
      { error: "This plan is not yet available. Check back soon." },
      { status: 503 }
    );
  }

  return Response.json({ url });
}
