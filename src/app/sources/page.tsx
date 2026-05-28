import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { ResearchSourceCard } from "@/components/research-source-card";
import {
  getResearchSourcePipelineMetrics,
  RESEARCH_SOURCES,
} from "@/lib/research-sources";
import { getPublicSourcesStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "情報ソース",
  description:
    "入店前チェック東京で参照する公的・公式情報、報道、調査候補と、転載を避けた扱い方を整理しています。",
  alternates: {
    canonical: "/sources",
  },
};

export default function SourcesPage() {
  const metrics = getResearchSourcePipelineMetrics();

  return (
    <>
      <JsonLd data={getPublicSourcesStructuredData()} />
      <PageHeader
        eyebrow="Sources"
        title="情報ソース"
        description="参照元としている公的・公式情報、報道、調査候補を確認できます。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="扱い方">
        <PolicyNote>
          掲載時は出典URL、確認日、独自要約を分けて扱います。本文、口コミ、画像、スクリーンショットは転載しません。
        </PolicyNote>
      </Section>

      <Section title="調査ソースの状況">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "調査ソース", value: metrics.totalSources },
            { label: "公式・公的", value: metrics.officialSources },
            { label: "報道", value: metrics.newsSources },
            { label: "優先確認", value: metrics.highPrioritySources },
            { label: "出典整理中", value: metrics.sourceOnlySources },
            { label: "審査待ち候補", value: metrics.candidateNeedsReviewSources },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
        <Link className="mt-4 inline-flex text-sm font-semibold text-action" href="/coverage">
          エリア別の蓄積状況を見る
        </Link>
      </Section>

      <Section title="調査中の情報ソース">
        <div className="grid gap-4 md:grid-cols-2">
          {RESEARCH_SOURCES.map((source) => (
            <ResearchSourceCard key={source.id} source={source} />
          ))}
        </div>
      </Section>

      <Section
        title="報告として蓄積するには"
        description="個別の注意報告として扱うには、具体的な経緯、確認日、公開可能な要約、管理者審査が必要です。"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href="/contribute"
          >
            情報提供の方針を見る
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/reports/new"
          >
            注意報告を送る
          </Link>
        </div>
      </Section>
    </>
  );
}
