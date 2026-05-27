import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ExternalRatingPanel } from "@/components/admin/external-rating-form";
import { ReportEditForm } from "@/components/admin/report-edit-form";
import { ReportStatusActions } from "@/components/admin/report-status-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { formatBoolean, formatCurrency, formatDate } from "@/lib/format";
import { getReportSourceTypeLabel, isSourceBackedReport } from "@/lib/report-sources";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  getAdminBuildingRelatedReports,
  getAdminExternalReviewSources,
  getAdminReportDetail,
  getAdminRiskTags,
} from "@/lib/admin/data";

type AdminReportDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "投稿詳細",
  description: "投稿詳細を管理する画面です。",
};

export const dynamic = "force-dynamic";

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-ink">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-muted">{value ?? "未入力"}</dd>
    </div>
  );
}

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: AdminReportDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { id } = await params;
  const query = await searchParams;
  const [report, riskTags, externalSources] = await Promise.all([
    getAdminReportDetail(id),
    getAdminRiskTags(),
    getAdminExternalReviewSources(),
  ]);

  if (!report) {
    notFound();
  }

  const relatedReports = await getAdminBuildingRelatedReports(report);

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="投稿詳細"
        description="公開前に表現、個人情報、証拠レベル、タグを確認してください。"
      >
        {query.saved ? (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            保存しました。
          </div>
        ) : null}
        {query.error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            入力内容または保存処理を確認してください。
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <div className="rounded-md border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-muted">
                  証拠 {report.evidenceLevel}
                </span>
                <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-muted">
                  {getReportSourceTypeLabel(report.sourceType)}
                </span>
                {isSourceBackedReport(report.sourceType) ? (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                    投稿者申告ではない出典確認候補
                  </span>
                ) : null}
                <span className="text-xs text-muted">{report.areaName}</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-ink">{report.shopName}</h2>
              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="住所" value={report.address} />
                <DetailItem label="建物名" value={report.buildingName} />
                <DetailItem label="階数" value={report.floor} />
                <DetailItem label="Google Maps URL" value={report.googleMapsUrl} />
                <DetailItem label="来店日時" value={formatDate(report.visitedAt)} />
                <DetailItem
                  label="人数"
                  value={report.partySize === null ? null : `${report.partySize}人`}
                />
                <DetailItem label="会計金額" value={formatCurrency(report.actualBilledAmount)} />
                <DetailItem label="投稿者メール" value={report.reporterEmail} />
              </dl>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">出典確認</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                報道・公的情報・外部傾向を元にした候補は、公開前に出典URL、確認日、現在状況、表現を確認してください。
              </p>
              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="出典種別" value={getReportSourceTypeLabel(report.sourceType)} />
                <DetailItem label="出典確認日" value={formatDate(report.sourceCheckedAt)} />
                <DetailItem label="出典タイトル" value={report.sourceTitle} />
                <DetailItem label="出典URL" value={report.sourceUrl} />
              </dl>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">同一住所・同一建物の確認候補</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                店名変更の可能性を確認するための管理者向け候補です。同一運営や同一店舗であることは断定せず、住所、建物名、階数、出典、証拠を個別に確認してください。
              </p>
              <div className="mt-4 grid gap-3">
                {relatedReports.length > 0 ? (
                  relatedReports.map((relatedReport) => (
                    <article
                      className="rounded-md border border-line bg-paper p-3 text-sm"
                      key={relatedReport.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={relatedReport.status} />
                        <span className="text-xs text-muted">
                          証拠 {relatedReport.evidenceLevel} / {relatedReport.areaName}
                        </span>
                      </div>
                      <a
                        className="mt-2 inline-flex font-semibold text-action"
                        href={`/admin/reports/${relatedReport.id}`}
                      >
                        {relatedReport.shopName}
                      </a>
                      <p className="mt-1 text-muted">{relatedReport.address ?? "住所未入力"}</p>
                      <p className="mt-1 text-muted">
                        {[relatedReport.buildingName, relatedReport.floor]
                          .filter(Boolean)
                          .join(" ") || "建物・階数未入力"}
                      </p>
                      <p className="mt-2 line-clamp-2 leading-6 text-muted">
                        {relatedReport.publicSummary}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState message="同一住所・同一建物の候補はまだありません。" />
                )}
              </div>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">申告内容</h2>
              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="客引き経由" value={formatBoolean(report.wasSolicited)} />
                <DetailItem
                  label="入店前料金説明"
                  value={formatBoolean(report.priceExplainedBeforeEntry)}
                />
                <DetailItem label="領収書" value={formatBoolean(report.receiptAvailable)} />
                <DetailItem
                  label="明細提示"
                  value={formatBoolean(report.itemizedBillAvailable)}
                />
                <DetailItem label="威圧感" value={formatBoolean(report.feltIntimidated)} />
                <DetailItem label="同行者" value={formatBoolean(report.hadCompanions)} />
                <DetailItem label="警察相談" value={formatBoolean(report.consultedPolice)} />
                <DetailItem
                  label="消費生活センター相談"
                  value={formatBoolean(report.consultedConsumerCenter)}
                />
                <DetailItem
                  label="カード会社相談"
                  value={formatBoolean(report.consultedCardCompany)}
                />
                <DetailItem label="支払い方法" value={report.paymentMethod} />
              </dl>

              <div className="mt-5 grid gap-4">
                <DetailItem label="客引き時の説明" value={report.solicitationDescription} />
                <DetailItem label="店内での説明" value={report.explanationInsideStore} />
                <DetailItem label="注文内容" value={report.orderedItems} />
                <DetailItem label="会計時対応" value={report.checkoutResponse} />
                <DetailItem label="退店時対応" value={report.exitResponse} />
                <DetailItem label="管理者向け補足" value={report.privateNote} />
              </div>
            </div>

            <ReportEditForm report={report} riskTags={riskTags} />

            <ExternalRatingPanel
              placeId={report.placeId}
              reportId={report.id}
              snapshots={report.externalRatings}
              sources={externalSources}
            />
          </div>

          <aside className="grid content-start gap-6">
            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">クイック操作</h2>
              <div className="mt-4">
                <ReportStatusActions reportId={report.id} />
              </div>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">公開前チェックリスト</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
                {[
                  "投稿者メール、証拠画像URL、非公開メモが公開サマリーに入っていない",
                  "断定、攻撃、個人情報、外部本文の転載がない",
                  "住所、建物名、階数を分かる範囲で確認した",
                  "同一住所・同一建物候補を確認し、同一運営とは断定していない",
                  "異議申立てや削除依頼がある場合は確認を優先した",
                  "承認する場合は証拠レベルとリスクタグを人間が確認した",
                ].map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-action" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">証拠画像</h2>
              <p className="mt-2 text-xs leading-5 text-muted">
                署名付きURLを管理者画面だけで発行します。URLは短時間で期限切れになります。
              </p>
              <div className="mt-4 grid gap-4">
                {report.evidenceFiles.length > 0 ? (
                  report.evidenceFiles.map((file) => (
                    <figure key={file.id} className="rounded-md border border-line bg-paper p-3">
                      {file.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={file.originalFileName}
                          className="max-h-72 w-full rounded object-contain"
                          src={file.signedUrl}
                        />
                      ) : (
                        <div className="rounded bg-surface p-4 text-sm text-muted">
                          画像URLを発行できませんでした。
                        </div>
                      )}
                      <figcaption className="mt-2 text-xs leading-5 text-muted">
                        {file.originalFileName} / {file.contentType} / {file.fileSizeBytes} bytes
                      </figcaption>
                    </figure>
                  ))
                ) : (
                  <EmptyState message="証拠画像は添付されていません。" />
                )}
              </div>
            </div>

            <div className="rounded-md border border-line bg-surface p-5">
              <h2 className="text-lg font-bold text-ink">操作ログ</h2>
              <div className="mt-4 grid gap-3">
                {report.actionLogs.length > 0 ? (
                  report.actionLogs.map((log) => (
                    <div key={log.id} className="rounded-md border border-line bg-paper p-3 text-sm">
                      <p className="font-semibold text-ink">{log.action}</p>
                      <p className="mt-1 text-muted">{log.summary}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(log.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState message="操作ログはまだありません。" />
                )}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </AdminShell>
  );
}
