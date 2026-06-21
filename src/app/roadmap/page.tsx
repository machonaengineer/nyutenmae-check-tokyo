import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import {
  getPhaseRoadmapByRange,
  getPhaseRoadmapMetrics,
  PHASE_ROADMAP_STATUS_LABELS,
  type PhaseRoadmapItem,
} from "@/lib/phase-roadmap";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "改善ロードマップ",
  description:
    "入店前チェック東京のMVP公開後の改善予定と、公開情報の扱い方を説明します。",
  alternates: {
    canonical: "/roadmap",
  },
  robots: NOINDEX_FOLLOW_ROBOTS,
};

const principles = [
  "投稿は自動公開せず、承認済み情報だけを公開します。",
  "投稿者メール、証拠画像、非公開メモは一般公開しません。",
  "同一住所・同一建物の候補は、同一運営や同一店舗であることを断定するものではありません。",
  "外部口コミやニュース本文は転載は禁止し、出典URL、確認日、独自要約として扱います。",
  "異議申立てがある場合は、公開維持より確認を優先します。",
] as const;

export default function RoadmapPage() {
  const metrics = getPhaseRoadmapMetrics();
  const shipped = getPhaseRoadmapByRange(13, 28);
  const expansion = getPhaseRoadmapByRange(29, 50);

  return (
    <>
      <PageHeader
        eyebrow="Roadmap"
        title="改善ロードマップ"
        description="入店前チェック東京は、公開情報の安全性を優先しながらフェーズ50までの成長基盤を段階的に整えます。"
        primaryAction={{ href: "/trust", label: "透明性を見る" }}
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

      <Section title="フェーズ状況">
        <PolicyNote>
          フェーズ29以降は、公開投稿を無理に増やす計画ではありません。信頼、審査、情報鮮度、収益化独立性、運用監視を整え、承認済み情報だけを広げるための土台です。
        </PolicyNote>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            { label: "全フェーズ", value: metrics.total },
            { label: "実装済み", value: metrics.shipped },
            { label: "土台整備済み", value: metrics.foundation },
            { label: "外部確認・データ待ち", value: metrics.externalReview + metrics.needsData },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <RoadmapSection
        description="MVP公開前後で完了した基盤です。"
        items={shipped}
        title="フェーズ13〜28"
      />

      <RoadmapSection
        description="フェーズ50までの安全成長ロードマップです。無料枠重視で、法務・運用・収益化の安全条件を先に固定します。"
        items={expansion}
        title="フェーズ29〜50"
      />

      <Section
        title="協力導線"
        description="実データの蓄積、誤りの修正、掲載独立性の維持を優先します。"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <RoadmapLink href="/contribute" label="情報提供のお願い" />
          <RoadmapLink href="/trust" label="透明性と安全運用" />
          <RoadmapLink href="/objection" label="異議申立て" />
          <RoadmapLink href="/sponsor" label="スポンサー相談" />
          <RoadmapLink href="/monetization-policy" label="収益化方針" />
        </div>
      </Section>
    </>
  );
}

function RoadmapSection({
  description,
  items,
  title,
}: {
  description: string;
  items: readonly PhaseRoadmapItem[];
  title: string;
}) {
  return (
    <Section title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.phase} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold text-action">フェーズ{item.phase}</p>
              <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold text-muted">
                {PHASE_ROADMAP_STATUS_LABELS[item.status]}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
            <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-xs text-muted">
              <div className="grid gap-1 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-3">
                <dt className="font-semibold text-ink">区分</dt>
                <dd className="min-w-0 break-words sm:text-right">{item.category}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-3">
                <dt className="font-semibold text-ink">安全条件</dt>
                <dd className="min-w-0 break-words sm:text-right">{item.guardrail}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-3">
                <dt className="font-semibold text-ink">成果物</dt>
                <dd className="min-w-0 break-words sm:text-right">{item.artifact}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </Section>
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
