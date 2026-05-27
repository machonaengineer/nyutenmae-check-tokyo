import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import {
  AREA_GROWTH_PRIORITY_LABELS,
  getPrioritySortedAreaGrowthPlans,
} from "@/lib/area-growth";
import {
  getResearchSourceCoverageMetrics,
  getResearchSourcePipelineMetrics,
} from "@/lib/research-sources";
import { getCoverageStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "情報蓄積状況",
  description:
    "入店前チェック東京の情報ソース、初期データ候補、エリア別の蓄積方針を公開します。",
  alternates: {
    canonical: "/coverage",
  },
};

export default function CoveragePage() {
  const pipelineMetrics = getResearchSourcePipelineMetrics();
  const coverageMetrics = getResearchSourceCoverageMetrics();
  const growthPlans = getPrioritySortedAreaGrowthPlans();

  return (
    <>
      <JsonLd data={getCoverageStructuredData()} />
      <PageHeader
        eyebrow="Coverage"
        title="情報蓄積状況"
        description="公的情報、報道、投稿、管理者確認を分けて扱い、承認済み情報だけを公開していくための進捗ページです。"
        primaryAction={{ href: "/reports/new", label: "情報を提供する" }}
      />

      <Section title="蓄積方針">
        <PolicyNote>
          このページは、公開済み注意報告の件数を競うものではありません。出典URL、確認日、独自要約、管理者審査をそろえ、未承認投稿、投稿者メール、証拠画像、非公開メモを公開しないための進捗を示します。
        </PolicyNote>
      </Section>

      <Section
        title="全体状況"
        description="出典は公開前審査の材料です。報道由来の候補も、本文転載は禁止し、個別公開前に現在状況と表現を確認します。"
      >
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "調査ソース", value: pipelineMetrics.totalSources },
            { label: "公式・公的", value: pipelineMetrics.officialSources },
            { label: "報道", value: pipelineMetrics.newsSources },
            { label: "優先確認", value: pipelineMetrics.highPrioritySources },
            { label: "出典整理中", value: pipelineMetrics.sourceOnlySources },
            { label: "審査待ち候補", value: pipelineMetrics.candidateNeedsReviewSources },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="エリア別の確認状況"
        description="エリア固有の情報と、都内共通の相談・注意喚起を分けて確認します。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {coverageMetrics.map((metric) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={metric.areaSlug}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink">{metric.areaName}</h2>
                <Link
                  className="text-sm font-semibold text-action"
                  href={`/areas/${metric.areaSlug}`}
                >
                  エリアを見る
                </Link>
              </div>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">エリア固有ソース</dt>
                  <dd className="font-bold text-ink">{metric.areaSpecificSources}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">都内共通ソース</dt>
                  <dd className="font-bold text-ink">{metric.commonSources}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">優先確認</dt>
                  <dd className="font-bold text-ink">{metric.highPrioritySources}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">審査待ち候補</dt>
                  <dd className="font-bold text-ink">
                    {metric.candidateNeedsReviewSources}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-7 text-muted">{metric.nextAction}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="次に厚くする順"
        description="検索流入、情報提供、非公開審査へつながる順に、エリア別の次アクションを整理します。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {growthPlans.map((plan) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={plan.areaSlug}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-action">
                    {AREA_GROWTH_PRIORITY_LABELS[plan.priority]}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-ink">{plan.areaName}</h2>
                </div>
                <Link
                  className="text-sm font-semibold text-action"
                  href={`/areas/${plan.areaSlug}`}
                >
                  詳細
                </Link>
              </div>
              <dl className="mt-4 grid gap-3 text-sm leading-7">
                <div>
                  <dt className="font-semibold text-ink">検索意図</dt>
                  <dd className="mt-1 text-muted">{plan.searchIntent}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">先に増やす情報</dt>
                  <dd className="mt-1 text-muted">{plan.immediateDataNeed}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">管理者の次アクション</dt>
                  <dd className="mt-1 text-muted">{plan.adminNextAction}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
                  href={`/reports/new?area=${plan.areaSlug}`}
                >
                  情報提供
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/areas/${plan.areaSlug}/contribute`}
                >
                  粒度を見る
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="次に増やす情報"
        description="実店舗や住所の公開は、人間の出典確認と審査を通したものだけに限定します。"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/sources"
          >
            情報ソースを見る
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/contribute"
          >
            情報提供の方針を見る
          </Link>
        </div>
      </Section>
    </>
  );
}
