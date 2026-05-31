import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata("管理画面");

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
