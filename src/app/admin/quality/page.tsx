import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { formatDate } from "@/lib/format";
import { requireAdminUser } from "@/lib/admin/auth";
import type { AdminReportListItem } from "@/lib/admin/data";
import { getAdminQualityQueues } from "@/lib/admin/data";

export const metadata: Metadata = {
  title: "品質キュー",
  description: "初期データ、建物情報、審査待ち、異議申立ての確認キューです。",
};

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const adminUser = await requireAdminUser();
  const queues = await getAdminQualityQueues();

  const summary = [
    { label: "建物名不足", value: queues.missingBuildingReports.length },
    { label: "階数不足", value: queues.missingFloorReports.length },
    { label: "7日超未審査", value: queues.stalePendingReports.length },
    { label: "出典確認待ち", value: queues.sourceNeedsReviewReports.length },
    { label: "未対応申立て", value: queues.openObjections.length },
    { label: "類似建物候補", value: queues.similarBuildingGroups.length },
  ];

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="品質キュー"
        description="公開判断の前に、建物情報、出典、異議申立て、重複候補を確認します。"
      >
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {summary.map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          同一住所・同一建物の候補は管理者確認用です。同一運営や同一店舗であることは断定せず、公開前に出典、証拠、異議申立て状況を確認してください。
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportQueue
            description="住所が入っている一方で建物名が未入力の投稿です。店名変更時の追跡性を上げるため、分かる範囲で補完します。"
            reports={queues.missingBuildingReports}
            title="建物名不足"
          />
          <ReportQueue
            description="建物名が入っている一方で階数が未入力の投稿です。建物内の別フロアと混同しないように確認します。"
            reports={queues.missingFloorReports}
            title="階数不足"
          />
          <ReportQueue
            description="7日以上、審査待ちまたは差し戻しのまま残っている投稿です。公開、非公開、差し戻しの判断を優先します。"
            reports={queues.stalePendingReports}
            title="7日超未審査"
          />
          <ReportQueue
            description="公的情報、報道、外部傾向など出典付き候補です。出典URL、確認日、独自要約の妥当性を確認します。"
            reports={queues.sourceNeedsReviewReports}
            title="出典確認待ち"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">同一住所・同一建物の候補</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              建物単位で複数投稿がある候補です。リスクタグ付与の前に内容を個別に確認します。
            </p>
            <div className="mt-4 grid gap-3">
              {queues.similarBuildingGroups.length > 0 ? (
                queues.similarBuildingGroups.slice(0, 20).map((group) => (
                  <article key={group.key} className="rounded-md border border-line bg-surface p-3">
                    <p className="text-sm font-bold text-ink">{group.buildingName}</p>
                    <p className="mt-1 text-sm text-muted">{group.address}</p>
                    <p className="mt-2 text-xs text-muted">候補 {group.reports.length}件</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.reports.slice(0, 5).map((report) => (
                        <Link
                          className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-action no-underline"
                          href={`/admin/reports/${report.id}`}
                          key={report.id}
                        >
                          {report.shopName}
                        </Link>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState message="同一住所・同一建物の候補はまだありません。" />
              )}
            </div>
          </div>

          <div className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">未対応の異議申立て</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              異議申立てがある場合は、公開維持より確認を優先します。必要に応じて投稿を非公開にしてください。
            </p>
            <div className="mt-4 grid gap-3">
              {queues.openObjections.length > 0 ? (
                queues.openObjections.slice(0, 20).map((objection) => (
                  <article key={objection.id} className="rounded-md border border-line bg-surface p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={objection.status} type="objection" />
                      <span className="text-xs text-muted">{formatDate(objection.createdAt)}</span>
                    </div>
                    <p className="mt-2 font-semibold text-ink">{objection.reasonCategory}</p>
                    <p className="mt-1 line-clamp-2 leading-6 text-muted">{objection.details}</p>
                    <Link className="mt-2 inline-flex font-semibold text-action" href="/admin/objections">
                      異議申立て管理を開く
                    </Link>
                  </article>
                ))
              ) : (
                <EmptyState message="未対応の異議申立てはありません。" />
              )}
            </div>
          </div>
        </div>
      </Section>
    </AdminShell>
  );
}

function ReportQueue({
  description,
  reports,
  title,
}: {
  description: string;
  reports: AdminReportListItem[];
  title: string;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-4 grid gap-3">
        {reports.length > 0 ? (
          reports.slice(0, 10).map((report) => (
            <article key={report.id} className="rounded-md border border-line bg-surface p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                <span className="text-xs text-muted">{report.areaName}</span>
              </div>
              <Link
                className="mt-2 inline-flex font-semibold text-action"
                href={`/admin/reports/${report.id}`}
              >
                {report.shopName}
              </Link>
              <p className="mt-1 text-muted">{report.address ?? "住所未入力"}</p>
              <p className="mt-1 text-muted">
                {[report.buildingName, report.floor].filter(Boolean).join(" ") ||
                  "建物・階数未入力"}
              </p>
              <p className="mt-1 text-xs text-muted">作成: {formatDate(report.createdAt)}</p>
            </article>
          ))
        ) : (
          <EmptyState message="対象はありません。" />
        )}
      </div>
    </div>
  );
}
