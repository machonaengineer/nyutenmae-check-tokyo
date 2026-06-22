import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import {
  getResearchSourceAreaPath,
  getResearchSourceById,
  getResearchSourceIntakeStatus,
  RESEARCH_SOURCES,
  RESEARCH_SOURCE_INTAKE_STATUS_LABELS,
  RESEARCH_SOURCE_PRIORITY_LABELS,
  RESEARCH_SOURCE_TYPE_LABELS,
} from "@/lib/research-sources";
import { createPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbStructuredData,
  getResearchSourceStructuredData,
} from "@/lib/structured-data";

type SourceDetailPageProps = {
  params: Promise<{ id: string }>;
};

const publicUseItems = [
  "出典URL、確認日、独自要約を分けて扱います。",
  "個別店舗や個人への断定ではなく、入店前確認と相談導線の補強に使います。",
  "投稿候補に進める場合も、管理者審査、表現確認、現在状況確認を通します。",
] as const;

const nonPublicItems = [
  "記事本文、口コミ本文、SNS本文、画像、スクリーンショットは転載しません。",
  "投稿者メールアドレス、証拠画像URL、非公開メモ、保存先の内部パスは公開しません。",
  "店員個人名、顔写真、電話番号、SNS IDを公開情報に含めません。",
] as const;

export function generateStaticParams() {
  return RESEARCH_SOURCES.map((source) => ({ id: source.id }));
}

export async function generateMetadata({
  params,
}: SourceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const source = getResearchSourceById(id);

  if (!source) {
    return {
      title: "情報ソース",
    };
  }

  return createPageMetadata({
    title: `${source.sourceTitle}｜情報ソース`,
    description: `${source.areaName}の入店前確認に使う出典情報です。${source.publicSummary}`,
    path: `/sources/${source.id}`,
    imageLabel: `${source.areaName}・出典確認・独自要約`,
    index: false,
  });
}

export default async function SourceDetailPage({ params }: SourceDetailPageProps) {
  const { id } = await params;
  const source = getResearchSourceById(id);

  if (!source) {
    notFound();
  }

  const intakeStatus = getResearchSourceIntakeStatus(source);
  const areaPath = getResearchSourceAreaPath(source);

  return (
    <>
      <JsonLd data={getResearchSourceStructuredData(source)} />
      <JsonLd
        data={getBreadcrumbStructuredData([
          { name: "情報ソース", path: "/sources" },
          { name: source.sourceTitle, path: `/sources/${source.id}` },
        ])}
      />
      <PageHeader
        eyebrow="Source Detail"
        title={source.sourceTitle}
        description={`${source.areaName}の入店前確認に使う出典情報です。本文転載ではなく、確認日と独自要約として扱います。`}
        primaryAction={{ href: areaPath, label: "関連エリアを見る" }}
      />

      <Section title="出典の扱い">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                {RESEARCH_SOURCE_TYPE_LABELS[source.sourceType]}
              </span>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                {RESEARCH_SOURCE_PRIORITY_LABELS[source.priority]}
              </span>
              <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
                {RESEARCH_SOURCE_INTAKE_STATUS_LABELS[intakeStatus]}
              </span>
              <span className="text-xs text-muted">確認日: {source.sourceCheckedAt}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">独自要約</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{source.publicSummary}</p>
            <h2 className="mt-6 text-lg font-bold text-ink">使い道</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{source.suggestedUse}</p>
            <h2 className="mt-6 text-lg font-bold text-ink">次の確認</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{source.nextAction}</p>
          </article>

          <aside className="rounded-md border border-line bg-surface p-5">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-ink">対象エリア</dt>
                <dd className="mt-1 text-muted">{source.areaName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">審査状態</dt>
                <dd className="mt-1 text-muted">
                  {RESEARCH_SOURCE_INTAKE_STATUS_LABELS[intakeStatus]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">出典URL</dt>
                <dd className="mt-1">
                  <a
                    className="break-all font-semibold text-action"
                    href={source.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    外部出典を確認する
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-5">
              <PolicyNote>
                このページは出典の要約管理ページです。個別店舗や個人について事実を断定するものではありません。
              </PolicyNote>
            </div>
          </aside>
        </div>
      </Section>

      <Section
        title="公開に使える範囲"
        description="Search Consoleで拾われる公開ページとして、転載リスクと非公開情報の混入を避けた形で整理します。"
      >
        <SimpleList items={publicUseItems} />
      </Section>

      <Section title="公開しない情報">
        <SimpleList items={nonPublicItems} />
      </Section>

      <Section
        title="関連ページ"
        description="出典だけで判断せず、エリア別の確認項目、相談導線、情報提供フォームに接続します。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href={areaPath}
          >
            {source.areaName}を見る
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/coverage/candidates"
          >
            公開候補化の流れを見る
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href={`/reports/quick${source.areaSlug === "all" ? "" : `?area=${source.areaSlug}`}`}
          >
            情報提供する
          </Link>
        </div>
      </Section>
    </>
  );
}
