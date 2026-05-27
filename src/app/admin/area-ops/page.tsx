import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/empty-state";
import { Section, SimpleList } from "@/components/page-blocks";
import { INITIAL_AREAS } from "@/lib/site";
import {
  AREA_COLLECTION_TRACKS,
  AREA_OPERATION_STATUSES,
  filterAreaOperationTasks,
  getAreaOperationCsv,
  getAreaOperationDashboard,
  isAreaCollectionTrack,
  isAreaOperationStatus,
  type AreaCollectionTrack,
  type AreaOperationStatus,
} from "@/lib/area-operations";
import { requireAdminUser } from "@/lib/admin/auth";

type AdminAreaOpsPageProps = {
  searchParams: Promise<{
    area?: string;
    status?: string;
    track?: string;
  }>;
};

export const metadata: Metadata = {
  title: "エリア運用",
  description: "エリア別の情報蓄積、公式ソース確認、建物確認、コンテンツ増強の運用画面です。",
};

export const dynamic = "force-dynamic";

const rules = [
  "エリア運用は公開情報を増やすための作業キューであり、個別店舗への断定表示ではありません。",
  "投稿、証拠画像、投稿者メール、非公開メモは公開ページに出さず、承認済み投稿だけを公開します。",
  "外部口コミ、報道本文、SNS本文、画像、スクリーンショットは転載せず、出典URL、確認日、独自要約で扱います。",
  "同一住所・同一建物の候補は管理者確認用です。同一運営や同一店舗とは断定しません。",
] as const;

export default async function AdminAreaOpsPage({
  searchParams,
}: AdminAreaOpsPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const dashboard = getAreaOperationDashboard();
  const selectedStatus =
    query.status && isAreaOperationStatus(query.status) ? query.status : undefined;
  const selectedTrack =
    query.track && isAreaCollectionTrack(query.track) ? query.track : undefined;
  const selectedArea = INITIAL_AREAS.some((area) => area.slug === query.area)
    ? query.area
    : undefined;
  const filteredTasks = filterAreaOperationTasks(dashboard.tasks, {
    areaSlug: selectedArea,
    status: selectedStatus,
    track: selectedTrack,
  });
  const csv = getAreaOperationCsv();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="エリア運用"
        description="掲載対象エリアごとに、公式ソース、投稿導線、建物確認、コンテンツ増強を分けて進捗確認します。"
      >
        <div className="mb-6">
          <SimpleList items={rules} />
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
          {[
            { label: "対象エリア", value: dashboard.metrics.totalAreas },
            { label: "運用タスク", value: dashboard.metrics.totalTasks },
            { label: "高優先", value: dashboard.metrics.highPriorityTasks },
            { label: "審査待ち", value: dashboard.metrics.needsReviewTasks },
            { label: "公開候補", value: dashboard.metrics.publishCandidateTasks },
            { label: "再確認優先", value: dashboard.metrics.staleSourceAreas },
            { label: "公式不足", value: dashboard.metrics.missingSourceAreas },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-bold text-ink">フィルタ</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <FilterGroup
              currentValue={selectedArea}
              items={[
                { href: buildFilterHref({ status: selectedStatus, track: selectedTrack }), label: "全エリア" },
                ...INITIAL_AREAS.map((area) => ({
                  href: buildFilterHref({
                    area: area.slug,
                    status: selectedStatus,
                    track: selectedTrack,
                  }),
                  label: area.name,
                  value: area.slug,
                })),
              ]}
              title="エリア"
            />
            <FilterGroup
              currentValue={selectedTrack}
              items={[
                { href: buildFilterHref({ area: selectedArea, status: selectedStatus }), label: "全トラック" },
                ...AREA_COLLECTION_TRACKS.map((track) => ({
                  href: buildFilterHref({
                    area: selectedArea,
                    status: selectedStatus,
                    track: track.track,
                  }),
                  label: track.label,
                  value: track.track,
                })),
              ]}
              title="トラック"
            />
            <FilterGroup
              currentValue={selectedStatus}
              items={[
                { href: buildFilterHref({ area: selectedArea, track: selectedTrack }), label: "全ステータス" },
                ...AREA_OPERATION_STATUSES.map((status) => ({
                  href: buildFilterHref({
                    area: selectedArea,
                    status: status.status,
                    track: selectedTrack,
                  }),
                  label: status.label,
                  value: status.status,
                })),
              ]}
              title="ステータス"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-md border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">運用タスク</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  表示中 {filteredTasks.length}件。公開判断は通常の投稿審査フローで行います。
                </p>
              </div>
              <Link
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-action no-underline"
                href="/admin/data"
              >
                初期データ審査へ
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <article key={task.id} className="rounded-md border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
                      <Badge tone={statusTone(task.status)}>{task.statusLabel}</Badge>
                      <span className="text-xs font-semibold text-muted">{task.areaName}</span>
                      <span className="text-xs font-semibold text-muted">{task.trackLabel}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-ink">{task.researchQuestion}</h3>
                    <div className="mt-3 grid gap-3 text-sm leading-6 md:grid-cols-2">
                      <Detail label="利用できる情報" value={task.acceptableSources} />
                      <Detail label="公開しない情報" value={task.nonPublicFields} />
                      <Detail label="安全な扱い" value={task.safeHandling} />
                      <Detail label="次の作業" value={task.nextAction} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-action no-underline"
                        href={`/areas/${task.areaSlug}`}
                        target="_blank"
                      >
                        公開エリア
                      </Link>
                      <Link
                        className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-action no-underline"
                        href={`/areas/${task.areaSlug}/contribute`}
                        target="_blank"
                      >
                        情報提供導線
                      </Link>
                      <Link
                        className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-action no-underline"
                        href={`/areas/${task.areaSlug}/evidence`}
                        target="_blank"
                      >
                        記録保存
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState message="条件に一致する運用タスクはありません。" />
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">エリア別ソース鮮度</h2>
              <div className="mt-4 grid gap-3">
                {dashboard.summaries.map((summary) => (
                  <article key={summary.areaSlug} className="rounded-md border border-line bg-surface p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-ink">{summary.areaName}</p>
                      <Badge tone={freshnessTone(summary.sourceFreshness)}>
                        {summary.sourceFreshnessLabel}
                      </Badge>
                    </div>
                    <dl className="mt-3 grid gap-2 text-xs text-muted">
                      <div className="flex justify-between gap-3">
                        <dt>エリア固有ソース</dt>
                        <dd className="font-semibold text-ink">{summary.areaSpecificSources}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>共通ソース</dt>
                        <dd className="font-semibold text-ink">{summary.commonSources}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>最終確認日</dt>
                        <dd className="font-semibold text-ink">
                          {summary.lastSourceCheckedAt ?? "確認中"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>次回確認目安</dt>
                        <dd className="font-semibold text-ink">
                          {summary.nextSourceCheckAt ?? "確認中"}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs leading-5 text-muted">{summary.nextPriorityAction}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">AREA_OPS_CSV</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                管理画面表示用の運用CSVです。実名入り候補や証拠資料は含めません。
              </p>
              <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-line bg-surface p-4 text-xs leading-6 text-ink">
                {csv}
              </pre>
            </div>
          </div>
        </div>
      </Section>
    </AdminShell>
  );
}

function buildFilterHref({
  area,
  status,
  track,
}: {
  area?: string;
  status?: AreaOperationStatus;
  track?: AreaCollectionTrack;
}) {
  const params = new URLSearchParams();

  if (area) {
    params.set("area", area);
  }

  if (status) {
    params.set("status", status);
  }

  if (track) {
    params.set("track", track);
  }

  const query = params.toString();
  return query ? `/admin/area-ops?${query}` : "/admin/area-ops";
}

function FilterGroup({
  currentValue,
  items,
  title,
}: {
  currentValue?: string;
  items: { href: string; label: string; value?: string }[];
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.value === currentValue || (!item.value && !currentValue);

          return (
            <Link
              className={`rounded-md border px-3 py-2 text-xs font-semibold no-underline ${
                active
                  ? "border-action bg-action text-white"
                  : "border-line bg-surface text-ink"
              }`}
              href={item.href}
              key={`${title}:${item.label}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-ink">{value}</p>
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tone}`}>{children}</span>
  );
}

function priorityLabel(priority: "high" | "medium" | "low") {
  return priority === "high" ? "高優先" : priority === "medium" ? "中優先" : "低優先";
}

function priorityTone(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "bg-red-50 text-red-800";
  }

  if (priority === "medium") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}

function statusTone(status: AreaOperationStatus) {
  switch (status) {
    case "not_started":
      return "bg-slate-100 text-slate-700";
    case "in_progress":
      return "bg-blue-50 text-blue-800";
    case "needs_review":
      return "bg-amber-50 text-amber-800";
    case "publish_candidate":
      return "bg-green-50 text-green-800";
    case "on_hold":
      return "bg-red-50 text-red-800";
  }
}

function freshnessTone(freshness: "fresh" | "review_soon" | "stale" | "missing") {
  switch (freshness) {
    case "fresh":
      return "bg-green-50 text-green-800";
    case "review_soon":
      return "bg-amber-50 text-amber-800";
    case "stale":
      return "bg-red-50 text-red-800";
    case "missing":
      return "bg-slate-100 text-slate-700";
  }
}
