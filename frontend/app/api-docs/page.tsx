import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "API — AgentReadiness",
};

export default function ApiDocsPage() {
  return (
    <ComingSoon
      title="REST API"
      description="Programmatic scanning, API key auth, webhooks, and a GitHub Action for CI/CD pipelines. Launching soon."
    />
  );
}
