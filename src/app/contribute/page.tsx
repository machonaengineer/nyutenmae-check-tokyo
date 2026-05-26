import type { Metadata } from "next";
import Link from "next/link";
import {
  DefinitionList,
  PageHeader,
  PolicyNote,
  Section,
  SimpleList,
} from "@/components/page-blocks";
import { INITIAL_AREAS } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

export const metadata: Metadata = {
  title: "情報提供のお願い",
  description:
    "入店前チェック東京で扱う注意報告、初期データ、外部情報の扱い方と情報提供導線です。",
  alternates: {
    canonical: "/contribute",
  },
};

const acceptedInfo = [
  "料金説明と会計内容の不一致に関する具体的な経緯",
  "明細、領収書、メニュー、カード利用控えなど確認に使える資料の有無",
  "客引き時の説明、店内説明、会計時説明の違い",
  "退店時対応、相談先への連絡、カード会社への相談状況",
] as const;

const rejectedInfo = [
  "味、雰囲気、通常接客に関する感想",
  "店員個人名、顔写真、電話番号、SNS IDなど個人を特定し得る情報",
  "Google口コミ、食べログ、SNS、ニュース本文の転載は禁止",
  "犯罪や属性を断定する表現、侮辱、脅迫、差別的表現",
] as const;

const sourcePolicies = [
  {
    label: "本人投稿",
    description:
      "投稿フォームから非公開で送信し、管理者が表現と証拠レベルを確認します。",
  },
  {
    label: "公的情報・報道",
    description:
      "本文を転載せず、出典URL、確認日、独自要約、リスクタグとして整理します。",
  },
  {
    label: "外部口コミ傾向",
    description:
      "個別口コミ本文や投稿者名を扱わず、傾向の独自要約と確認日だけを管理します。",
  },
] as const;

export default function ContributePage() {
  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="情報提供のお願い"
        description="公開できる注意情報を増やすため、料金説明、会計確認、明細提示、退店時対応に関する具体的な報告を募集しています。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="提供してほしい情報">
        <SimpleList items={acceptedInfo} />
        <div className="mt-6">
          <PolicyNote>
            投稿は自動公開されません。証拠画像と投稿者メールアドレスは一般公開せず、管理者確認用として扱います。
          </PolicyNote>
        </div>
      </Section>

      <Section title="扱わない情報">
        <SimpleList items={rejectedInfo} />
      </Section>

      <Section
        title="初期データの扱い"
        description="情報量を増やす場合も、転載や断定を避け、公開前審査を維持します。"
      >
        <DefinitionList items={sourcePolicies} />
      </Section>

      <Section
        title="エリアとテーマから報告する"
        description="近い内容を選ぶと、フォームの一部が事前選択されます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <article key={area.slug} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <h2 className="text-lg font-bold text-ink">{area.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOPIC_GUIDES.map((topic) => (
                  <Link
                    key={topic.slug}
                    className="rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink no-underline transition hover:bg-paper"
                    href={`/reports/new?area=${area.slug}&tag=${topic.riskTagSlugs[0] ?? ""}`}
                  >
                    {topic.title}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
