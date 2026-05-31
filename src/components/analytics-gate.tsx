import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export function AnalyticsGate() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const enableGa = process.env.NODE_ENV === "production" && Boolean(gaId);
  const enableVercel = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED === "true";

  if (!enableGa && !enableVercel) {
    return null;
  }

  return (
    <>
      {enableGa ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
      {enableVercel ? <Analytics /> : null}
    </>
  );
}
