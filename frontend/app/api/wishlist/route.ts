import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email, answers } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY;

  if (!url || !key) {
    // No Supabase configured — log and succeed gracefully
    console.log("Wishlist signup (no DB):", email, answers);
    return Response.json({ ok: true });
  }

  const client = createClient(url, key);

  const { error } = await client.from("wishlist").upsert(
    { email: email.toLowerCase().trim(), answers },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Wishlist insert failed:", error.message);
    return Response.json({ error: "Could not save" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
