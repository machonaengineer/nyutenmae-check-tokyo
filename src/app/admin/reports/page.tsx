import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { Container } from "@/components/site-shell";
import { formatDate } from "@/lib/format";
import { getPlaceBuildingLabel } from "@/lib/place-labels";
import { getReportSourceTypeLabel, isSourceBackedReport } from "@/lib/report-sources";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminReports } from "@/lib/admin/data";
import { getStatusLabel, isReportStatus, REPORT_STATUSES } from "@/lib/admin/types";

type AdminReportsPageProps = {
  searchParams: Promise<{
    status?: string;
    saved?: string;
    error?: string;
    shop_name?: string;
    address?: string;
    building_name?: string;
    floor?: string;
  }>;
};

export const metadata: Metadata = {
  title: "投稿管理",
  description: "投稿一覧を管理する画面です。",
};

export const dynamic = "force-dynamic";

function normalizeSearchParam(value: string | undefined) {
  return value?.trim().slice(0, 80) ?? "";
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const selectedStatus =
    query.status && isReportStatus(query.status) ? query.status : "all";
  const searchFilters = {
    shopName: normalizeSearchParam(query.shop_name),
    address: normalizeSearchParam(query.address),
    buildingName: normalizeSearchParam(query.building_name),
    floor: normalizeSearchParam(query.floor),
  };
  const hasSearchFilter = Object.values(searchFilters).some(Boolean);
  const allReports = await getAdminReports("all");
  const reports = await getAdminReports({
    status: selectedStatus,
    ...searchFilters,
  });
  const pendingCount = allReports.filter((report) => report.status === "pending").length;
  const reviewCount = allReports.filter((report) => report.status === "needs_review").length;
  const approvedCount = allReports.filter((report) => report.status === "approved").length;
  const locationParams = new URLSearchParams();

  if (searchFilters.shopName) {
    locationParams.set("shop_name", searchFilters.shopName);
  }
  if (searchFilters.address) {
    locationParams.set("address", searchFilters.address);
  }
  if (searchFilters.buildingName) {
    locationParams.set("building_name", searchFilters.buildingName);
  }
  if (searchFilters.floor) {
    locationParams.set("floor", searchFilters.floor);
  }

  function getStatusHref(status: string) {
    const params = new URLSearchParams(locationParams);
    if (status !== "all") {
      params.set("status", status);
    }
    const queryString = params.toString();

    return queryString ? `/admin/reports?${queryString}` : "/admin/reports";
  }

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
        <div className="mb-5 grid gap-3 md:grid-cols-4">
          {[
            { label: "全投稿", value: allReports.length },
            { label: "審査待ち", value: pendingCount },
            { label: "差し戻し", value: reviewCount },
            { label: "承認済み", value: approvedCount },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <form className="mb-5 rounded-md border border-line bg-surface p-4" method="get">
          {selectedStatus !== "all" ? (
            <input name="status" type="hidden" value={selectedStatus} />
          ) : null}
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1 text-sm font-semibold text-ink">
              店舗名
              <input
                className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
                defaultValue={searchFilters.shopName}
                maxLength={80}
                name="shop_name"
                placeholder="店舗名・看板の一部"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              住所
              <input
                className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
                defaultValue={searchFilters.address}
                maxLength={80}
                name="address"
                placeholder="丁目・番地など"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              建物名
              <input
                className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
                defaultValue={searchFilters.buildingName}
                maxLength={80}
                name="building_name"
                placeholder="ビル名・会館名"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              階数
              <input
                className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
                defaultValue={searchFilters.floor}
                maxLength={20}
                name="floor"
                placeholder="例：3F"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="rounded-md bg-action px-4 py-2 text-sm font-bold text-white" type="submit">
              建物情報で絞り込む
            </button>
            <Link className="text-sm font-semibold text-action no-underline hover:underline" href="/admin/reports">
              条件をクリア
            </Link>
            <p className="text-xs leading-5 text-muted">
              店名変更の可能性があるため、住所、建物名、階数を審査時の手がかりにします。
            </p>
          </div>
        </form>

        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href={getStatusHref("all")}
            className={`rounded-md border px-3 py-2 text-sm font-semibold no-underline transition ${
              selectedStatus === "all"
                ? "border-action bg-action text-white"
                : "border-line bg-white text-ink hover:bg-paper"
            }`}
          >
            すべて
          </Link>
          {REPORT_STATUSES.map((status) => (
            <Link
              key={status}
              href={getStatusHref(status)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold no-underline transition ${
                selectedStatus === status
                  ? "border-action bg-action text-white"
                  : "border-line bg-white text-ink hover:bg-paper"
              }`}
            >
              {getStatusLabel(status)}
            </Link>
          ))}
        </div>
        {hasSearchFilter ? (
          <p className="mb-4 text-sm leading-6 text-muted">
            建物情報の絞り込み結果: {reports.length}件。検索条件は管理者確認用であり、公開ページでは承認済み情報だけを表示します。
          </p>
        ) : null}

        {reports.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-line bg-white shadow-[0_12px_30px_rgb(23_32_42/0.05)]">
            <div className="grid gap-0">
              {reports.map((report) => {
                const buildingLabel = getPlaceBuildingLabel(report);

                return (
                <article key={report.id} className="border-b border-line p-4 transition hover:bg-paper/70 last:border-b-0">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
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
                            出典確認
                          </span>
                        ) : null}
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
                      {buildingLabel ? (
                        <p className="mt-1 text-sm text-muted">{buildingLabel}</p>
                      ) : null}
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {report.publicSummary}
                      </p>
                    </div>
                    <div className="rounded-md bg-paper px-3 py-2 text-sm leading-6 text-muted md:text-right">
                      <p>{report.reporterEmail}</p>
                      <p>作成: {formatDate(report.createdAt)}</p>
                      <p>更新: {formatDate(report.updatedAt)}</p>
                    </div>
                  </div>
                </article>
                );
              })}
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
