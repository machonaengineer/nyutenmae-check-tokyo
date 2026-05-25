import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader, Section } from "@/components/page-blocks";
import { PublicNotice } from "@/components/public-notice";
import { formatBoolean, formatCurrency, formatDate } from "@/lib/format";
import { getPlaceDisplayName, getPublicPlaceDetail } from "@/lib/public-data";

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

  return {
    title: getPlaceDisplayName(detail.place),
    description: `${getPlaceDisplayName(detail.place)}の承認済み注意報告を確認するページです。`,
  };
}

export default async function PlaceDetailPage({ params }: PlacePageProps) {
  const { id } = await params;
  const detail = await getPublicPlaceDetail(id);

  if (!detail) {
    notFound();
  }

  const { place, reports } = detail;
  const displayName = getPlaceDisplayName(place);

  return (
    <>
      <PageHeader
        eyebrow="Place"
        title={displayName}
        description="承認済み投稿に基づく注意情報です。証拠画像、投稿者メールアドレス、管理者メモは表示しません。"
        primaryAction={{ href: "/objection", label: "異議申立て" }}
      />

      <Section title="公開情報">
        <div className="grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted">店名または住所</p>
            <p className="mt-2 text-lg font-bold text-ink">{displayName}</p>
            {place.address ? <p className="mt-2 text-sm leading-6 text-muted">{place.address}</p> : null}
            {place.buildingName || place.floor ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                {[place.buildingName, place.floor].filter(Boolean).join(" ")}
              </p>
            ) : null}
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
      </Section>

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
                <p className="mt-4 text-sm leading-7 text-ink">{report.publicSummary}</p>
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
    </>
  );
}
