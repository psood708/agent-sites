import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Sign In — AgentReadiness",
};

export default function SignInPage() {
  return (
    <ComingSoon
      title="Sign In"
      description="Domain verification, score history, and agent analytics dashboards — coming in v2."
    />
  );
}
