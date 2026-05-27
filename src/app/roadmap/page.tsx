import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/page-blocks";

export const metadata: Metadata = {
  title: "改善ロードマップ",
  description:
    "入店前チェック東京のMVP公開後の改善予定と、公開情報の扱い方を説明します。",
};

const roadmap = [
  {
    phase: "フェーズ13",
    title: "初期データ投入・審査ワークフロー強化",
    summary: "建物名、階数、出典、異議申立てを確認しやすくし、承認前の審査品質を上げます。",
  },
  {
    phase: "フェーズ14",
    title: "データ品質・重複検知強化",
    summary: "同一住所・同一建物の類似候補を管理者が確認しやすくします。",
  },
  {
    phase: "フェーズ15",
    title: "公開情報ページ強化",
    summary: "エリア別、トラブル種別別の入店前確認ページを増やします。",
  },
  {
    phase: "フェーズ16",
    title: "投稿獲得導線強化",
    summary: "SNS共有、情報提供、相談導線から投稿フォームへの流れを改善します。",
  },
  {
    phase: "フェーズ17",
    title: "異議申立て・削除依頼フロー強化",
    summary: "店舗側や関係者からの確認依頼に対し、非公開化や再審査の手順を明確にします。",
  },
  {
    phase: "フェーズ18",
    title: "収益化準備強化",
    summary: "掲載独立性を維持したまま、広告やスポンサー問い合わせの導線を整えます。",
  },
  {
    phase: "フェーズ19",
    title: "運用監視・バックアップ強化",
    summary: "公開前後の安全確認、ログ確認、バックアップ手順を整備します。",
  },
  {
    phase: "フェーズ20",
    title: "MVP公開後改善",
    summary: "投稿数、検索流入、審査工数を見ながらUI、DB、運用を継続改善します。",
  },
] as const;

const principles = [
  "投稿は自動公開せず、承認済み情報だけを公開します。",
  "投稿者メール、証拠画像、非公開メモは一般公開しません。",
  "同一住所・同一建物の候補は、同一運営や同一店舗であることを断定するものではありません。",
  "外部口コミやニュース本文は転載は禁止し、出典URL、確認日、独自要約として扱います。",
  "異議申立てがある場合は、公開維持より確認を優先します。",
] as const;

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Roadmap"
        title="改善ロードマップ"
        description="入店前チェック東京は、公開情報の安全性を優先しながら段階的に機能を広げます。"
        primaryAction={{ href: "/reports/new", label: "情報を提供する" }}
      />

      <Section
        title="公開情報の扱い方"
        description="注意情報として役立つことと、断定や個人情報公開を避けることを両立します。"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle} className="rounded-md border border-line bg-white p-4 text-sm leading-7 text-muted">
              {principle}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="フェーズ13〜20"
        description="MVP公開前後で優先する改善です。公開前に人間の法務・運用レビューを行う前提です。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {roadmap.map((item) => (
            <article key={item.phase} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-xs font-semibold text-action">{item.phase}</p>
              <h2 className="mt-2 text-lg font-bold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="協力導線"
        description="実データの蓄積、誤りの修正、掲載独立性の維持を優先します。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <RoadmapLink href="/contribute" label="情報提供のお願い" />
          <RoadmapLink href="/objection" label="異議申立て" />
          <RoadmapLink href="/sponsor" label="スポンサー相談" />
          <RoadmapLink href="/monetization-policy" label="収益化方針" />
        </div>
      </Section>
    </>
  );
}

function RoadmapLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-line bg-surface px-4 py-3 text-sm font-bold text-action no-underline transition hover:bg-paper"
      href={href}
    >
      {label}
    </Link>
  );
}
