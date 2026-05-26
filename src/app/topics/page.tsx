import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { TOPIC_GUIDES } from "@/lib/topic-content";

export const metadata: Metadata = {
  title: "トラブル種別別ガイド",
  description:
    "料金説明、明細提示、客引き経由の来店、会計時・退店時対応について、入店前に確認したい項目を整理します。",
  alternates: {
    canonical: "/topics",
  },
};

export default function TopicsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Topics"
        title="トラブル種別別ガイド"
        description="投稿前、入店前、会計前に確認しやすいよう、料金説明や明細提示などの確認項目を種別ごとに整理しています。"
        primaryAction={{ href: "/checklists", label: "確認リストを見る" }}
      />

      <Section title="確認テーマ">
        <div className="grid gap-4 md:grid-cols-2">
          {TOPIC_GUIDES.map((topic) => (
            <article key={topic.slug} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <h2 className="text-xl font-bold text-ink">{topic.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{topic.description}</p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-action no-underline"
                href={`/topics/${topic.slug}`}
              >
                詳しく見る
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section title="表示方針">
        <PolicyNote>
          本ガイドは一般的な確認項目の整理です。特定の店舗や個人について事実を断定するものではありません。
        </PolicyNote>
      </Section>
    </>
  );
}
