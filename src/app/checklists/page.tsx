import type { Metadata } from "next";
import Link from "next/link";
import { ChecklistClient } from "@/components/checklist-client";
import { MonetizationSlot } from "@/components/growth/monetization-slot";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import {
  CHECKOUT_CHECK_ITEMS,
  ENTRY_CHECK_ITEMS,
  RECORD_KEEP_ITEMS,
} from "@/lib/growth-content";
import { createPageMetadata } from "@/lib/seo";
import { INITIAL_AREAS, SITE } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "入店前チェックリスト｜入店前チェック東京",
  description:
    "都内繁華街で入店前、会計前、退店後に確認したい料金説明、明細、領収書、記録保存のチェックリストです。スマホでチェックし、必要に応じて相談先も確認できます。",
  path: "/checklists",
  imageLabel: "料金確認・明細確認・相談先確認",
});

const interactiveChecklistSections = [
  {
    title: "入店前",
    items: [
      "店名を確認した",
      "住所または建物名を確認した",
      "料金表を確認した",
      "席料を確認した",
      "サービス料を確認した",
      "延長料金を確認した",
      "指名料や追加料金を確認した",
      "税込、税別を確認した",
      "支払い方法を確認した",
      "客引き経由ではないか確認した",
      "不安な場合は入店しない判断をする",
    ],
  },
  {
    title: "会計前",
    items: [
      "注文内容と人数を確認した",
      "明細、領収書の発行可否を確認した",
      "カード決済前に端末表示額を確認した",
      "退店条件を確認した",
    ],
  },
  {
    title: "保存",
    items: [
      "レシート、明細、メニューを保存する",
      "説明内容、日時、同行者情報を記録する",
      "相談が必要な場合は110番、#9110、188、カード会社を確認する",
    ],
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "入店前チェックリスト",
  mainEntity: [
    {
      "@type": "Question",
      name: "入店前に何を確認すべきですか",
      acceptedAnswer: {
        "@type": "Answer",
        text: "席料、サービス料、チャージ、税、時間制、飲み放題条件など、会計に関わる条件を確認してください。",
      },
    },
    {
      "@type": "Question",
      name: "会計時に不安がある場合は何を残すべきですか",
      acceptedAnswer: {
        "@type": "Answer",
        text: "レシート、明細、メニュー、説明内容、日時、人数、支払い方法、請求金額を保存してください。",
      },
    },
  ],
};

export default function ChecklistsPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <PageHeader
        eyebrow="Checklist"
        title="入店前チェックリスト"
        description="料金説明、会計確認、明細提示、退店時対応に関する不安を減らすための確認項目です。"
        primaryAction={{ href: "/map", label: "注意マップを見る" }}
      />

      <Section
        title="スマホで使えるチェックリスト"
        description="チェック状態はこのブラウザ内に一時保存されます。スクリーンショットやURL共有もしやすい構成です。"
      >
        <ChecklistClient
          sections={interactiveChecklistSections}
          storageKey="nyutenmae-entry-checklist"
        />
        <div className="mt-6">
          <PolicyNote>
            条件が曖昧な場合や説明が変わる場合は、入店を急がず、同行者と確認してください。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="入店前に確認すること"
        description="キャッチについて行く前、店内に入る前、注文前の確認に使えます。"
      >
        <SimpleList items={ENTRY_CHECK_ITEMS} />
      </Section>

      <Section title="会計前に確認すること">
        <SimpleList items={CHECKOUT_CHECK_ITEMS} />
      </Section>

      <Section title="保存しておきたい情報">
        <SimpleList items={RECORD_KEEP_ITEMS} />
      </Section>

      <Section
        title="エリア別チェックリスト"
        description="掲載対象エリアごとの公開ページへ移動できます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <article key={area.slug} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-sm font-semibold text-action">{area.center}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">{area.name}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{area.summary}</p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-action no-underline"
                href={`/areas/${area.slug}/checklist`}
              >
                このエリアの確認項目を見る
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="トラブル種別別ガイド"
        description="料金説明、明細提示、客引き経由の来店など、確認テーマ別にも整理しています。"
      >
        <Link
          href="/topics"
          className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
        >
          種別ガイドを見る
        </Link>
      </Section>

      <Section
        title="表示方針"
        description={`${SITE.name}は、入店前確認に役立つ料金条件、明細、相談先の情報を扱います。`}
      >
        <PolicyNote>
          掲載情報は入店前確認の参考です。料金、条件、明細は入店前・会計前にもご自身で確認してください。
        </PolicyNote>
        <div className="mt-6">
          <MonetizationSlot placement="checklist" />
        </div>
      </Section>
    </>
  );
}
