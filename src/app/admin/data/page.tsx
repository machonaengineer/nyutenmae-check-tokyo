import type { Metadata } from "next";
import { importInitialDataCandidatesAction } from "@/app/admin/data/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { InitialDataValidator } from "@/components/admin/initial-data-validator";
import { Section, SimpleList } from "@/components/page-blocks";
import {
  getInitialDataReviewMetrics,
  getInitialDataReviewQueue,
  hasInitialDataCandidateCsv,
  type InitialDataReviewQueueItem,
} from "@/lib/admin/initial-data-candidates";
import { requireAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "初期データ検証",
  description: "初期データCSVを投入前に検証する管理画面です。",
};

export const dynamic = "force-dynamic";

const dataRules = [
  "この画面はCSVの投入前検証と、管理者限定の非公開デフォルト投入を行います。",
  "投入できる行は pending または needs_review、証拠レベル Hidden のみです。",
  "Google口コミ、食べログ、SNS、ニュース本文をそのまま転載しないでください。",
  "公開サマリーには投稿者メールアドレス、証拠画像URL、非公開メモを入れないでください。",
  "approved への変更は、投稿詳細画面で人間が審査してから行ってください。",
] as const;

type AdminDataPageProps = {
  searchParams: Promise<{
    candidate_import?: string;
    candidate_imported?: string;
    candidate_skipped?: string;
  }>;
};

export default async function AdminDataPage({ searchParams }: AdminDataPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const reviewQueue = getInitialDataReviewQueue();
  const reviewMetrics = getInitialDataReviewMetrics();
  const candidateCsvConfigured = hasInitialDataCandidateCsv();
  const candidateImportMessage =
    query.candidate_import === "success"
      ? "候補データを非公開投入しました。"
      : query.candidate_import === "missing_source"
        ? "候補CSVがサーバー側に設定されていません。"
        : "候補データの投入に失敗しました。";

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="初期データ検証"
        description="INITIAL_DATA_TEMPLATE.csv の内容を確認し、公開前審査用の非公開投稿として投入します。"
      >
        <div className="mb-6">
          <SimpleList items={dataRules} />
        </div>

        {query.candidate_import ? (
          <div
            className={
              query.candidate_import === "success"
                ? "mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
                : "mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
            }
          >
            <p className="font-bold">{candidateImportMessage}</p>
            <p className="mt-1">
              投入: {query.candidate_imported ?? "0"}件 / 重複スキップ:{" "}
              {query.candidate_skipped ?? "0"}件
            </p>
          </div>
        ) : null}

        <InitialDataReviewQueuePanel
          candidateCsvConfigured={candidateCsvConfigured}
          metrics={reviewMetrics}
          queue={reviewQueue}
        />

        <InitialDataValidator />
      </Section>
    </AdminShell>
  );
}

function InitialDataReviewQueuePanel({
  candidateCsvConfigured,
  metrics,
  queue,
}: {
  candidateCsvConfigured: boolean;
  metrics: ReturnType<typeof getInitialDataReviewMetrics>;
  queue: InitialDataReviewQueueItem[];
}) {
  return (
    <div className="mb-6 grid gap-5">
      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">初期データ審査キュー</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              候補はすべて needs_review / Hidden として非公開投入します。公開承認は投稿詳細で人間が出典、現在状況、表現を確認してから行います。
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              実名入り候補CSVはGit管理せず、管理者が下のCSV欄へ貼り付けるか、サーバー側環境変数に一時設定して扱います。
            </p>
          </div>
          <form action={importInitialDataCandidatesAction}>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-bold text-white transition hover:bg-action-strong disabled:cursor-not-allowed disabled:bg-muted"
              disabled={!candidateCsvConfigured}
              type="submit"
            >
              候補を非公開投入する
            </button>
            {!candidateCsvConfigured ? (
              <p className="mt-2 max-w-64 text-xs leading-5 text-muted">
                サーバー側の候補CSVが未設定です。通常は下のCSV欄から投入してください。
              </p>
            ) : null}
          </form>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {[
            { label: "候補", value: metrics.total },
            { label: "優先", value: metrics.highPriority },
            { label: "出典未確認", value: metrics.sourceUnverified },
            { label: "法務未確認", value: metrics.legalNotStarted },
            { label: "推奨status", value: metrics.needsReview },
          ].map((item) => (
            <div className="rounded-md border border-line bg-surface p-3" key={item.label}>
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-2 text-xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-base font-bold text-ink">確認順</h2>
        </div>
        <div className="divide-y divide-line">
          {queue.map((item) => (
            <article className="grid gap-3 p-4 text-sm lg:grid-cols-[120px_1fr]" key={item.rowNumber}>
              <div>
                <p className="font-bold text-ink">行 {item.rowNumber}</p>
                <p className="mt-1 text-xs text-muted">{item.reviewPriority}</p>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                    {item.observedArea}
                  </span>
                  <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                    {item.recommendedStatus}
                  </span>
                  <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
                    出典確認 {item.sourceVerified}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-ink">{item.placeName}</p>
                <p className="mt-1 text-muted">
                  住所精度: {item.addressPrecision} / 建物: {item.buildingNameStatus} /
                  階数: {item.floorStatus}
                </p>
                <p className="mt-2 leading-6 text-muted">{item.nextAction}</p>
                {item.sourceUrl ? (
                  <a
                    className="mt-2 inline-flex font-semibold text-action"
                    href={item.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    出典を確認する
                  </a>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-muted">
                    出典URLは非公開CSV側で確認します。
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
