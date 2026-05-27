import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { Section, SimpleList } from "@/components/page-blocks";
import { ResearchSourceCard } from "@/components/research-source-card";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  getResearchSourceCoverageMetrics,
  getResearchSourceCsv,
  getResearchSourceIntakeStatus,
  getResearchSourcePipelineMetrics,
  RESEARCH_SOURCES,
} from "@/lib/research-sources";

export const metadata: Metadata = {
  title: "調査キュー",
  description: "初期データ化する前の公的・公式ソース調査キューです。",
};

export const dynamic = "force-dynamic";

const rules = [
  "公的・公式ソースを確認し、本文転載は禁止せず独自要約だけを作る。",
  "個別店舗への注意報告にする場合は、具体的な根拠と管理者審査を必須にする。",
  "初期データCSVへ入れる場合も、statusはpendingまたはneeds_review、evidence_levelはHiddenから始める。",
  "外部口コミ、ニュース本文、SNS投稿本文、画像、スクリーンショットは保存しない。",
] as const;

export default async function AdminResearchPage() {
  const adminUser = await requireAdminUser();
  const csv = getResearchSourceCsv();
  const pipelineMetrics = getResearchSourcePipelineMetrics();
  const coverageMetrics = getResearchSourceCoverageMetrics();
  const reviewCandidates = RESEARCH_SOURCES.filter(
    (source) => getResearchSourceIntakeStatus(source) === "candidate_needs_review",
  );

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="調査キュー"
        description="公開報告を増やす前段階として、公式情報ソースと次の確認アクションを管理します。"
      >
        <div className="mb-6">
          <SimpleList items={rules} />
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "調査ソース", value: pipelineMetrics.totalSources },
            { label: "公式・公的", value: pipelineMetrics.officialSources },
            { label: "報道", value: pipelineMetrics.newsSources },
            { label: "優先", value: pipelineMetrics.highPrioritySources },
            { label: "候補化前", value: pipelineMetrics.sourceOnlySources },
            { label: "審査待ち候補", value: pipelineMetrics.candidateNeedsReviewSources },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">次に審査する候補</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              候補化済みの出典は、INITIAL_DATA_CANDIDATES を pending / Hidden
              として確認し、承認前に表現、出典、現在状況、異議導線を見ます。
            </p>
            <div className="mt-4 grid gap-3">
              {reviewCandidates.slice(0, 6).map((source) => (
                <a
                  className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-action no-underline"
                  href={source.sourceUrl}
                  key={source.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.areaName} / {source.sourceTitle}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">エリア別ソース状況</h2>
            <div className="mt-4 grid gap-3">
              {coverageMetrics.map((metric) => (
                <div
                  className="rounded-md border border-line bg-surface p-3 text-sm"
                  key={metric.areaSlug}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-ink">{metric.areaName}</p>
                    <p className="text-xs text-muted">
                      エリア固有 {metric.areaSpecificSources} / 共通 {metric.commonSources}
                    </p>
                  </div>
                  <p className="mt-2 leading-6 text-muted">{metric.nextAction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-bold text-ink">SOURCE_RESEARCH_QUEUE.csv</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            リポジトリのCSVと同じ内容です。調査進捗はローカルで更新し、公開判断は通常の審査フローで行います。
          </p>
          <pre className="mt-4 max-h-72 overflow-auto rounded-md border border-line bg-surface p-4 text-xs leading-6 text-ink">
            {csv}
          </pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {RESEARCH_SOURCES.map((source) => (
            <ResearchSourceCard key={source.id} source={source} showNextAction />
          ))}
        </div>
      </Section>
    </AdminShell>
  );
}
