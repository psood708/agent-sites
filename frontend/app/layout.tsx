import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AgentReadiness — Is your site ready for AI agents?",
  description: "Score any website for AI agent readiness in seconds. Get a free /llms.txt.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <head>
        {/* Set theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Nav */}
        <nav
          className="flex items-center justify-between px-6 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: "var(--blue)" }}
          >
            agentreadiness
          </span>
          <ThemeToggle />
        </nav>

        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
