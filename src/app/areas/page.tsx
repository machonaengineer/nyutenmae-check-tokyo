import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getPublicAreaSummaries } from "@/lib/public-data";
import { PageHeader, Section } from "@/components/page-blocks";
import { PublicNotice } from "@/components/public-notice";
import { SocialShareActions } from "@/components/social-share-actions";
import {
  getResearchSourceIntakeStatus,
  getResearchSourcesByArea,
} from "@/lib/research-sources";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "エリア別入店前チェック｜入店前チェック東京",
  description:
    "新宿・歌舞伎町、池袋、渋谷、上野、六本木など、都内繁華街ごとの料金確認、明細確認、相談先、公式確認先を整理しています。",
  path: "/areas",
  imageLabel: "エリア別・料金確認・相談先",
});

export default async function AreasPage() {
  const areas = await getPublicAreaSummaries();
  const areaRows = areas.map((area) => {
    const sources = getResearchSourcesByArea(area.slug);

    return {
      ...area,
      officialSourceCount: sources.filter((source) => source.sourceType !== "news")
        .length,
      reviewCandidateCount: sources.filter(
        (source) => getResearchSourceIntakeStatus(source) === "candidate_needs_review",
      ).length,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Areas"
        title="掲載対象エリア"
        description="都内繁華街のうち、入店前の料金確認や会計確認に関わる注意情報を整理しやすいエリアから順次拡大しています。"
      />

      <Section title="エリア一覧">
        <div className="grid gap-4 md:grid-cols-2">
          {areaRows.map((area) => (
            <article key={area.slug} className="rounded-md border border-line bg-surface p-5">
              <p className="text-sm font-semibold text-action">{area.centerLabel}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">
                <Link href={`/areas/${area.slug}`} className="text-ink no-underline hover:underline">
                  {area.name}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{area.description}</p>
              <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                <p>承認済み場所: {area.approvedPlaceCount}件</p>
                <p>承認済み報告: {area.approvedReportCount}件</p>
                <p>公式確認先: {area.officialSourceCount}件</p>
                <p>確認候補: {area.reviewCandidateCount}件</p>
                <p>最新: {formatDate(area.latestReportedAt)}</p>
              </div>
              {area.approvedReportCount === 0 ? (
                <p className="mt-4 rounded-md border border-line bg-white px-3 py-2 text-xs leading-6 text-muted">
                  個別の注意表示はまだありません。公式確認先と入店前確認項目を先に公開し、
                  投稿は承認後だけ表示します。
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="エリア一覧を共有する">
        <SocialShareActions title="入店前チェック東京の対象エリア" url={getAbsoluteSiteUrl("/areas")} />
      </Section>
    </>
  );
}
