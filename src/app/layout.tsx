import type { Metadata } from "next";
import { AppShell } from "@/components/site-shell";
import { SITE } from "@/lib/site";
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
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary",
    title: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
