import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const SITE_URL = "https://agent-sites-five.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AgentReadiness — Is your site ready for AI agents?",
  description:
    "Score any website for AI agent readiness in seconds. Check /llms.txt, robots.txt, structured data, and more. Get a free /llms.txt draft.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "AgentReadiness — Is your site ready for AI agents?",
    description:
      "Score any website for AI agent readiness in seconds. Check /llms.txt, robots.txt, structured data, and more. Get a free /llms.txt draft.",
    url: SITE_URL,
    siteName: "AgentReadiness",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AgentReadiness",
              description:
                "Score any website for AI agent readiness in seconds. Check /llms.txt, robots.txt, structured data, and more.",
              url: SITE_URL,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NavBar userEmail={user?.email ?? null} />

        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
