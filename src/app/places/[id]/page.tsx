import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader, Section } from "@/components/page-blocks";
import { PublicNotice } from "@/components/public-notice";
import { SocialShareActions } from "@/components/social-share-actions";
import {
  formatExternalRating,
  formatRatingCount,
  getExternalCollectionMethodLabel,
} from "@/lib/external-ratings";
import { formatBoolean, formatCurrency, formatDate } from "@/lib/format";
import { getPlaceBuildingLabel } from "@/lib/place-labels";
import {
  getPlaceDisplayName,
  getPublicPlaceDetail,
} from "@/lib/public-data";
import { getReportSourceTypeLabel, isSourceBackedReport } from "@/lib/report-sources";
import { createPageMetadata } from "@/lib/seo";
import { getAbsoluteSiteUrl } from "@/lib/social";

type PlacePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getPublicPlaceDetail(id);

  if (!detail) {
    return {
      title: "場所詳細",
    };
  }

  const displayName = getPlaceDisplayName(detail.place);
  const indexableEvidence = detail.place.evidenceLevels.some((level) =>
    ["S", "A", "B"].includes(level),
  );

  return createPageMetadata({
    title: `${displayName}の入店前チェック｜料金確認・相談先`,
    description: `${displayName}周辺の公開情報と、入店前に確認したい料金説明、明細、相談先の手がかりを整理します。`,
    path: `/places/${id}`,
    imageLabel: "料金確認・明細確認・相談先",
    index: detail.reports.length > 0 && indexableEvidence,
  });
}

export default async function PlaceDetailPage({ params }: PlacePageProps) {
  const { id } = await params;
  const detail = await getPublicPlaceDetail(id);

  if (!detail) {
    notFound();
  }

  const { place, reports, externalRatings } = detail;
  const displayName = getPlaceDisplayName(place);
  const buildingLabel = getPlaceBuildingLabel(place);

  return (
    <>
      <PageHeader
        eyebrow="Place"
        title={displayName}
        description="料金確認、明細、相談導線の手がかりを確認できます。"
        primaryAction={{ href: "/objection", label: "異議申立て" }}
      />

      <Section title="公開情報">
        <div className="grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted">店名・住所・建物</p>
            <p className="mt-2 text-lg font-bold text-ink">{displayName}</p>
            {place.address ? <p className="mt-2 text-sm leading-6 text-muted">{place.address}</p> : null}
            {buildingLabel ? <p className="mt-2 text-sm leading-6 text-muted">{buildingLabel}</p> : null}
          </div>
          <div className="grid gap-3 text-sm text-muted">
            <p>エリア: {place.areaName}</p>
            <p>報告件数: {place.approvedReportCount}件</p>
            <p>証拠レベル: {place.evidenceLevels.length ? place.evidenceLevels.join(" / ") : "確認中"}</p>
            <p>最新報告日: {formatDate(place.latestReportedAt)}</p>
          </div>
        </div>

        {place.riskTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {place.riskTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6">
          <PublicNotice />
        </div>
        <div className="mt-4 rounded-md border border-line bg-white p-4 text-sm leading-7 text-muted">
          <p className="font-semibold text-ink">同一住所・同一建物の確認メモ</p>
          <p className="mt-2">
            店名が変わる場合があるため、住所、建物名、階数も手がかりとして扱います。
            同じ住所や建物でも、同一運営や同一店舗とは限りません。入店前に料金条件と明細の有無を確認してください。
          </p>
        </div>
      </Section>

      {externalRatings.length > 0 ? (
        <Section
          title="外部評価参考値"
          description="外部評価と本サービスの注意報告は評価軸が異なります。外部サービス上の集計参考値として表示しています。"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {externalRatings.map((rating) => (
              <article key={rating.id} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-ink">{rating.sourceLabel}</h2>
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                    参考値
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm leading-6 text-muted">
                  <div>
                    <dt className="font-semibold text-ink">外部集計評価</dt>
                    <dd>
                      {formatExternalRating(rating.ratingValue, rating.ratingScale)} /{" "}
                      {formatRatingCount(rating.ratingCount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">確認日</dt>
                    <dd>{formatDate(rating.checkedAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">取得方法</dt>
                    <dd>{getExternalCollectionMethodLabel(rating.collectionMethod)}</dd>
                  </div>
                </dl>
                {rating.publicNote ? (
                  <p className="mt-4 text-sm leading-6 text-muted">{rating.publicNote}</p>
                ) : null}
                <a
                  className="mt-4 inline-flex text-sm font-semibold text-action"
                  href={rating.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  出典を確認する
                </a>
                {rating.requiresAttribution ? (
                  <p className="mt-3 text-xs leading-5 text-muted">
                    出典: {rating.attributionLabel ?? rating.sourceLabel}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="公開サマリー">
        {reports.length > 0 ? (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article key={report.id} className="rounded-md border border-line bg-surface p-5">
                <div className="grid gap-2 text-sm text-muted md:grid-cols-3">
                  <p>報告日: {formatDate(report.reportedAt)}</p>
                  <p>証拠レベル: {report.evidenceLevel}</p>
                  <p>会計金額: {formatCurrency(report.actualBilledAmount)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs font-semibold text-muted">
                    {getReportSourceTypeLabel(report.sourceType)}
                  </span>
                  {isSourceBackedReport(report.sourceType) ? (
                    <>
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                        投稿者申告ではない出典確認情報
                      </span>
                      {report.sourceCheckedAt ? (
                        <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-muted">
                          出典確認日: {formatDate(report.sourceCheckedAt)}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-ink">{report.publicSummary}</p>
                {isSourceBackedReport(report.sourceType) ? (
                  <div className="mt-4 rounded-md border border-line bg-white p-3 text-xs leading-5 text-muted">
                    <p>
                      この項目は公開情報をもとに管理者が独自要約した注意情報です。外部本文や口コミ本文は転載していません。
                    </p>
                    {report.sourceUrl ? (
                      <a
                        className="mt-2 inline-flex font-semibold text-action"
                        href={report.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        出典を確認する
                      </a>
                    ) : null}
                    {report.sourceTitle ? (
                      <p className="mt-1">出典: {report.sourceTitle}</p>
                    ) : null}
                  </div>
                ) : null}
                <dl className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink">客引き経由の来店</dt>
                    <dd className="mt-1">{formatBoolean(report.wasSolicited)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">入店前の料金説明</dt>
                    <dd className="mt-1">{formatBoolean(report.priceExplainedBeforeEntry)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">領収書</dt>
                    <dd className="mt-1">{formatBoolean(report.receiptAvailable)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">明細提示</dt>
                    <dd className="mt-1">{formatBoolean(report.itemizedBillAvailable)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="現在、公開できる報告サマリーはありません。" />
        )}
      </Section>

      <Section
        title="相談導線"
        description="会計内容に不安がある場合は、手元の明細、領収書、カード利用履歴、説明内容のメモを保管してください。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["消費生活センターへの相談を検討", "警察への相談を検討", "カード会社への連絡を検討"].map((item) => (
            <div key={item} className="rounded-md border border-line bg-surface p-4 text-sm font-semibold text-ink">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support"
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
          >
            相談先を確認する
          </Link>
          <Link
            href={`/objection?place_id=${place.id}`}
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            掲載内容への異議申立て
          </Link>
          <Link
            href="/guidelines"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            投稿ガイドラインを見る
          </Link>
        </div>
      </Section>

      <Section title="このページを共有する">
        <SocialShareActions title={`${displayName}の注意情報`} url={getAbsoluteSiteUrl(`/places/${place.id}`)} />
      </Section>
    </>
  );
}
