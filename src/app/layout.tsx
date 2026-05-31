import type { Metadata } from "next";
import { AdsenseGate } from "@/components/adsense-gate";
import { AnalyticsGate } from "@/components/analytics-gate";
import { JsonLd } from "@/components/json-ld";
import { AppShell } from "@/components/site-shell";
import { SITE } from "@/lib/site";
import { getOgImagePath } from "@/lib/seo";
import { getSiteStructuredData } from "@/lib/structured-data";
import "./globals.css";

const defaultTitle =
  "入店前チェック東京｜都内繁華街の料金確認・相談先・注意マップ";
const defaultDescription =
  "入店前チェック東京は、新宿・池袋・渋谷・六本木など都内繁華街での料金説明、明細、相談先を入店前に確認するための実用サイトです。客引きについて行く前の確認リスト、地図、相談窓口を整理しています。";
const defaultOgImage = getOgImagePath("入店前チェック東京", "料金確認・明細確認・相談先確認");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  title: {
    default: defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    siteName: SITE.name,
    type: "website",
    locale: "ja_JP",
    url: SITE.url,
    images: [
      {
        url: defaultOgImage,
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
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
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
