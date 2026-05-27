import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { Section, SimpleList } from "@/components/page-blocks";
import { ResearchSourceCard } from "@/components/research-source-card";
import { requireAdminUser } from "@/lib/admin/auth";
import { getResearchSourceCsv, RESEARCH_SOURCES } from "@/lib/research-sources";

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

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="調査キュー"
        description="公開報告を増やす前段階として、公式情報ソースと次の確認アクションを管理します。"
      >
        <div className="mb-6">
          <SimpleList items={rules} />
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
