import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { Container } from "@/components/site-shell";
import { formatDate } from "@/lib/format";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminReports } from "@/lib/admin/data";
import { getStatusLabel, isReportStatus, REPORT_STATUSES } from "@/lib/admin/types";

type AdminReportsPageProps = {
  searchParams: Promise<{ status?: string; saved?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "投稿管理",
  description: "投稿一覧を管理する画面です。",
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const selectedStatus =
    query.status && isReportStatus(query.status) ? query.status : "all";
  const reports = await getAdminReports(selectedStatus);

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="投稿一覧"
        description="非公開投稿も含め、管理者だけが確認できます。公開判断は詳細画面で行います。"
      >
        {query.saved ? (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            更新しました。
          </div>
        ) : null}
        {query.error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            処理に失敗しました。
          </div>
        ) : null}
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href="/admin/reports"
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink no-underline hover:bg-paper"
          >
            すべて
          </Link>
          {REPORT_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/reports?status=${status}`}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink no-underline hover:bg-paper"
            >
              {getStatusLabel(status)}
            </Link>
          ))}
        </div>

        {reports.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="grid gap-0">
              {reports.map((report) => (
                <article key={report.id} className="border-b border-line p-4 last:border-b-0">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={report.status} />
                        <span className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-muted">
                          証拠 {report.evidenceLevel}
                        </span>
                        <span className="text-xs text-muted">{report.areaName}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-ink">
                        <Link
                          className="text-ink no-underline hover:underline"
                          href={`/admin/reports/${report.id}`}
                        >
                          {report.shopName}
                        </Link>
                      </h2>
                      {report.address ? (
                        <p className="mt-1 text-sm text-muted">{report.address}</p>
                      ) : null}
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {report.publicSummary}
                      </p>
                    </div>
                    <div className="text-sm leading-6 text-muted md:text-right">
                      <p>{report.reporterEmail}</p>
                      <p>作成: {formatDate(report.createdAt)}</p>
                      <p>更新: {formatDate(report.updatedAt)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message="条件に一致する投稿はありません。" />
        )}
      </Section>
      <Container>
        <div className="pb-10 text-xs leading-6 text-muted">
          Service Role Keyはサーバー側だけで使用し、ブラウザには送信していません。
        </div>
      </Container>
    </AdminShell>
  );
}
