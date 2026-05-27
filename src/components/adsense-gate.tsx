import Script from "next/script";
import { getAdsenseClient, shouldLoadAdsenseScript } from "@/lib/adsense";

export function AdsenseGate() {
  const client = getAdsenseClient();

  if (!shouldLoadAdsenseScript() || !client) {
    return null;
  }

  const params = new URLSearchParams({ client });

  return (
    <Script
      async
      crossOrigin="anonymous"
      id="adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?${params.toString()}`}
      strategy="afterInteractive"
    />
  );
}
