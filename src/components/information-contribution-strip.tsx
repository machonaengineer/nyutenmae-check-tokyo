"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPathPrefixes = [
  "/admin",
  "/reports/new",
  "/reports/quick",
  "/reports/thanks",
  "/objection",
] as const;

export function InformationContributionStrip() {
  const pathname = usePathname();
  const shouldHide = hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  return (
    <aside className="border-b border-action/15 bg-action/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-sm leading-6 text-ink">
          <span className="font-bold">情報提供を募集しています。</span>
          <span className="ml-1 text-muted">
            店名が曖昧でも、住所・建物名・階数・料金説明・明細の有無を非公開で送れます。
          </span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/reports/quick"
          >
            30秒で送る
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/contribute"
          >
            募集項目を見る
          </Link>
        </div>
      </div>
    </aside>
  );
}
