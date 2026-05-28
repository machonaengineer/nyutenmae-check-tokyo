import Link from "next/link";
import type { ReactNode } from "react";
import { SiteSearchForm } from "@/components/site-search-form";
import { FOOTER_LINKS, NAV_ITEMS, SITE } from "@/lib/site";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 shadow-[0_1px_0_rgb(23_32_42/0.03)] backdrop-blur">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
            <span aria-hidden="true" className="h-9 w-1.5 rounded-full bg-action" />
            <span className="flex flex-col">
              <span className="text-base font-bold tracking-normal text-ink">{SITE.name}</span>
              <span className="text-xs text-muted">繁華街の入店前チェック</span>
            </span>
          </Link>
          <div className="hidden flex-1 justify-center lg:flex">
            <SiteSearchForm inputId="site-search-desktop" />
          </div>
          <nav aria-label="主要ナビゲーション" className="hidden items-center gap-1 2xl:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.emphasis
                    ? "whitespace-nowrap rounded-md bg-action px-3.5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-action-dark"
                    : "whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-muted no-underline transition hover:bg-paper hover:text-ink"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          aria-label="モバイル主要ナビゲーション"
          className="flex gap-2 overflow-x-auto pb-3 2xl:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.emphasis
                  ? "shrink-0 rounded-md bg-action px-3 py-2 text-sm font-semibold text-white no-underline"
                  : "shrink-0 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-muted no-underline"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pb-3 md:hidden">
          <SiteSearchForm inputId="site-search-mobile" />
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#17241f] text-white">
      <Container>
        <div className="grid gap-6 py-9 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-base font-bold">{SITE.name}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              料金確認、明細、相談先を整理する入店前チェックサイトです。詳しい掲載方針は透明性ページで確認できます。
            </p>
          </div>
          <nav aria-label="補助ナビゲーション" className="flex flex-wrap gap-3 md:justify-end">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 text-sm text-white/85 no-underline hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
