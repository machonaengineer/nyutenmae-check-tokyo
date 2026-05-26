import { Analytics } from "@vercel/analytics/next";

export function AnalyticsGate() {
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== "true") {
    return null;
  }

  return <Analytics />;
}
