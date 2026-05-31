import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { createPageMetadata } from "@/lib/seo";
import { SEARCH_GUIDES } from "@/lib/search-guides";

export const metadata: Metadata = createPageMetadata({
  title: "実用ガイド｜入店前チェック東京",
  description:
    "客引きについて行く前の確認、料金確認、明細保存、カード決済確認、相談準備など、都内繁華街で入店前に使える実用ガイド一覧です。",
  path: "/guides",
  imageLabel: "実用ガイド・チェックリスト・相談先",
});

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="実用ガイド"
        description="繁華街で入店前、会計前後、相談前に確認したい項目を、断定や転載を避けて整理します。"
        primaryAction={{ href: "/reports/quick", label: "30秒で情報提供" }}
      />

      <Section title="検索される場面別ガイド">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SEARCH_GUIDES.map((guide) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={guide.slug}
            >
              <p className="text-sm font-semibold text-action">{guide.shortTitle}</p>
              <h2 className="mt-2 text-lg font-bold text-ink">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{guide.description}</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                検索意図: {guide.searchIntent}
              </p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                href={`/guides/${guide.slug}`}
              >
                ガイドを見る
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <PolicyNote>
            このガイドは、特定の店舗や個人について事実を断定するものではありません。投稿者の申告情報、証拠、相談導線を分けて扱います。
          </PolicyNote>
        </div>
      </Section>
    </>
  );
}
