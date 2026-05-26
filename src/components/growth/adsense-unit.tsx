"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdsenseUnitProps = {
  client: string;
  label: string;
  slot: string;
};

export function AdsenseUnit({ client, label, slot }: AdsenseUnitProps) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense may block in test browsers or by extensions. Rendering should not break the page.
    }
  }, [client, slot]);

  return (
    <div
      aria-label={label}
      className="rounded-md border border-line bg-paper px-4 py-3"
      data-testid="adsense-slot"
    >
      <p className="mb-2 text-[11px] font-semibold text-muted">広告</p>
      <ins
        className="adsbygoogle block min-h-[90px]"
        data-ad-client={client}
        data-ad-format="auto"
        data-ad-slot={slot}
        data-full-width-responsive="true"
        style={{ display: "block" }}
      />
    </div>
  );
}
