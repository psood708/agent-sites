import type { Metadata } from "next";
import PricingClient from "./PricingClient";
import SurveySection from "./SurveySection";

export const metadata: Metadata = {
  title: "Pricing — AgentReadiness",
  description: "Free scanner forever. Base at $19/month for monitoring. Pro at $79/month for shadow layer hosting and agent analytics.",
};

export default function PricingPage() {
  return (
    <>
      <SurveySection />
      <PricingClient />
    </>
  );
}
