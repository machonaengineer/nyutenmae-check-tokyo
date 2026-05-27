import type { Metadata } from "next";
import { AdsenseGate } from "@/components/adsense-gate";
import { AnalyticsGate } from "@/components/analytics-gate";
import { JsonLd } from "@/components/json-ld";
import { AppShell } from "@/components/site-shell";
import { SITE } from "@/lib/site";
import { getSiteStructuredData } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "入店前チェック東京",
    "都内繁華街",
    "注意報告",
    "料金説明",
    "会計確認",
    "明細提示",
    "客引き",
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    siteName: SITE.name,
    type: "website",
    locale: "ja_JP",
    url: SITE.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <AdsenseGate />
      </head>
      <body>
        <JsonLd data={getSiteStructuredData()} />
        <AppShell>{children}</AppShell>
        <AnalyticsGate />
      </body>
    </html>
  );
}
