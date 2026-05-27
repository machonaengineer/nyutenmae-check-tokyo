import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getPublicAreaSummaries } from "@/lib/public-data";
import { PageHeader, Section } from "@/components/page-blocks";
import { PublicNotice } from "@/components/public-notice";
import { SocialShareActions } from "@/components/social-share-actions";
import { getAbsoluteSiteUrl } from "@/lib/social";

export const metadata: Metadata = {
  title: "対象エリア",
  description: "入店前チェック東京の掲載対象エリア一覧です。",
};

export default async function AreasPage() {
  const areas = await getPublicAreaSummaries();

  return (
    <>
      <PageHeader
        eyebrow="Areas"
        title="掲載対象エリア"
        description="都内繁華街のうち、入店前の料金確認や会計確認に関わる注意情報を整理しやすいエリアから順次拡大しています。"
      />

      <Section title="エリア一覧">
        <div className="grid gap-4 md:grid-cols-2">
          {areas.map((area) => (
            <article key={area.slug} className="rounded-md border border-line bg-surface p-5">
              <p className="text-sm font-semibold text-action">{area.centerLabel}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">
                <Link href={`/areas/${area.slug}`} className="text-ink no-underline hover:underline">
                  {area.name}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{area.description}</p>
              <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3">
                <p>場所: {area.approvedPlaceCount}件</p>
                <p>報告: {area.approvedReportCount}件</p>
                <p>最新: {formatDate(area.latestReportedAt)}</p>
              </div>
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
