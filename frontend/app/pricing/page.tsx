import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Pricing — AgentReadiness",
};

export default function PricingPage() {
  return (
    <ComingSoon
      title="Pricing"
      description="Free tier forever for public scanning. Paid plans coming soon — domain analytics, shadow layer hosting, and team seats."
    />
  );
}
