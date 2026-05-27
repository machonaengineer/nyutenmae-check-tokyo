import { getAdsenseClient, shouldLoadAdsenseScript } from "@/lib/adsense";

export function AdsenseGate() {
  const client = getAdsenseClient();

  if (!shouldLoadAdsenseScript() || !client) {
    return null;
  }

  const params = new URLSearchParams({ client });

  return (
    <script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?${params.toString()}`}
    />
  );
}
