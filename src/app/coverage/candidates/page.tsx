import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";
import {
  getPublicationCandidateRows,
  PUBLICATION_CANDIDATE_STAGES,
} from "@/lib/publication-candidates";

export const metadata: Metadata = {
  title: "公開候補化の流れ",
  description:
    "公式ソースや投稿候補を、非公開審査から公開可能なエリア注意情報へ進めるための確認手順です。",
  alternates: {
    canonical: "/coverage/candidates",
  },
  robots: NOINDEX_FOLLOW_ROBOTS,
};

export default function PublicationCandidatesPage() {
  const rows = getPublicationCandidateRows();

  return (
    <>
      <PageHeader
        eyebrow="Publication Candidates"
        title="公開候補化の流れ"
        description="公式ソース、投稿候補、建物情報を、未承認のまま出さずに公開可能な情報へ育てるためのページです。"
        primaryAction={{ href: "/admin/data", label: "管理画面で確認" }}
      />

      <Section title="公開前の確認ステージ">
        <SimpleList
          items={PUBLICATION_CANDIDATE_STAGES.map(
            (stage) => `${stage.label}: ${stage.description}`,
          )}
        />
        <div className="mt-6">
          <PolicyNote>
            このページは公開判断の基準を説明するもので、未承認投稿や証拠画像を公開するものではありません。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="エリア別の公開候補化"
        description="個別店舗に進める前に、エリア単位の確認項目、相談導線、投稿導線を厚くします。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={row.areaSlug}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-action">{row.proposedAsset}</p>
                  <h2 className="mt-2 text-lg font-bold text-ink">{row.areaName}</h2>
                </div>
                <Link
                  className="text-sm font-semibold text-action"
                  href={`/areas/${row.areaSlug}`}
                >
                  エリア
                </Link>
              </div>
              <dl className="mt-4 grid gap-2 text-sm leading-7">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">確認ソース</dt>
                  <dd className="font-bold text-ink">{row.sourceCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">優先確認</dt>
                  <dd className="font-bold text-ink">{row.highPrioritySourceCount}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-7 text-muted">{row.nextAction}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{row.publishableScope}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
