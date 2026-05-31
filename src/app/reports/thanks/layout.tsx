import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata("送信完了");

export default function ReportThanksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
