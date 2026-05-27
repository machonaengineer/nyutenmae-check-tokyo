import type { Metadata } from "next";
import Link from "next/link";
import {
  importInitialDataCandidatesAction,
  importInitialDataReviewCandidateAction,
  stageOfficialAreaSeedCandidatesAction,
  updateInitialDataReviewCandidateAction,
} from "@/app/admin/data/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { InitialDataCandidateStager } from "@/components/admin/initial-data-candidate-stager";
import { InitialDataValidator } from "@/components/admin/initial-data-validator";
import { EmptyState } from "@/components/empty-state";
import { Section, SimpleList } from "@/components/page-blocks";
import type {
  AdminInitialDataReviewCandidate,
  AdminInitialDataReviewWorkflow,
} from "@/lib/admin/data";
import { getAdminInitialDataReviewWorkflow } from "@/lib/admin/data";
import {
  getInitialDataReviewMetrics,
  getInitialDataReviewQueue,
  hasInitialDataCandidateCsv,
  type InitialDataReviewQueueItem,
} from "@/lib/admin/initial-data-candidates";
import {
  getOfficialAreaSeedCandidateCsv,
  getOfficialAreaSeedCandidateMetrics,
} from "@/lib/admin/official-area-seed-candidates";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  getInitialDataLegalReviewStatusLabel,
  getInitialDataPriorityLabel,
  getInitialDataPublishDecisionLabel,
  INITIAL_DATA_LEGAL_REVIEW_STATUSES,
  INITIAL_DATA_PUBLISH_DECISIONS,
  INITIAL_DATA_REVIEW_PRIORITIES,
} from "@/lib/admin/types";
import { formatDate } from "@/lib/format";

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
    decision?: string;
    q?: string;
    readiness?: string;
    candidate_import?: string;
    candidate_imported?: string;
    candidate_skipped?: string;
    candidate_import_error?: string;
    report_id?: string;
    candidate_review_saved?: string;
    candidate_review_error?: string;
    official_seed?: string;
    official_staged?: string;
    official_skipped?: string;
  }>;
};

export default async function AdminDataPage({ searchParams }: AdminDataPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const reviewQueue = getInitialDataReviewQueue();
  const reviewMetrics = getInitialDataReviewMetrics();
  const candidateCsvConfigured = hasInitialDataCandidateCsv();
  const officialSeedCsv = getOfficialAreaSeedCandidateCsv();
  const officialSeedMetrics = getOfficialAreaSeedCandidateMetrics();
  const reviewWorkflow = await getAdminInitialDataReviewWorkflow();
  const filters = {
    decision: query.decision ?? "all",
    q: query.q ?? "",
    readiness: query.readiness ?? "all",
  };
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
        {query.official_seed ? (
          <div
            className={
              query.official_seed === "success"
                ? "mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
                : "mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
            }
          >
            <p className="font-bold">
              {query.official_seed === "success"
                ? "公式ソース由来のエリア候補を審査DBへ登録しました。"
                : "公式ソース由来のエリア候補登録に失敗しました。"}
            </p>
            <p className="mt-1">
              登録: {query.official_staged ?? "0"}件 / 重複スキップ:{" "}
              {query.official_skipped ?? "0"}件
            </p>
          </div>
        ) : null}
        {query.candidate_review_saved ? (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
            初期データ候補の審査状態を更新しました。
          </div>
        ) : null}
        {query.candidate_review_error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            候補審査の更新に失敗しました。非公開投入へ進める場合は、出典確認、公開サマリー確認、建物確認、法務確認を完了してください。
          </div>
        ) : null}
        {query.candidate_imported ? (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
            <p className="font-bold">
              {query.candidate_imported === "deduped"
                ? "既存の非公開投稿へ候補を紐付けました。"
                : "候補から非公開デフォルトの投稿を作成しました。"}
            </p>
            {query.report_id ? (
              <Link className="mt-1 inline-flex font-semibold text-green-900" href={`/admin/reports/${query.report_id}`}>
                作成した投稿を確認する
              </Link>
            ) : null}
          </div>
        ) : null}
        {query.candidate_import_error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            非公開投稿の作成に失敗しました。出典確認、公開サマリー確認、建物確認、法務確認、判断がすべて完了しているか確認してください。
          </div>
        ) : null}

        <InitialDataReviewQueuePanel
          candidateCsvConfigured={candidateCsvConfigured}
          metrics={reviewMetrics}
          queue={reviewQueue}
        />

        <OfficialAreaSeedPanel
          candidateTableAvailable={reviewWorkflow.available}
          csv={officialSeedCsv}
          metrics={officialSeedMetrics}
        />

        <div className="mb-6 grid gap-6">
          <InitialDataCandidateStager />
          <InitialDataReviewWorkflowPanel filters={filters} workflow={reviewWorkflow} />
        </div>

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

function OfficialAreaSeedPanel({
  candidateTableAvailable,
  csv,
  metrics,
}: {
  candidateTableAvailable: boolean;
  csv: string;
  metrics: ReturnType<typeof getOfficialAreaSeedCandidateMetrics>;
}) {
  return (
    <div className="mb-6 rounded-md border border-line bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">公式ソース安全候補</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            公的・公式ソースだけを使ったエリア単位の非公開審査候補です。個別店舗の公開候補ではなく、エリア別の確認観点、相談導線、情報提供導線を厚くするために使います。
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            登録先は候補審査DBです。公開ページには出ず、承認済み投稿にもなりません。
          </p>
        </div>
        <form action={stageOfficialAreaSeedCandidatesAction}>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-bold text-white transition hover:bg-action-strong disabled:cursor-not-allowed disabled:bg-muted"
            disabled={!candidateTableAvailable}
            type="submit"
          >
            公式候補を審査DBへ登録
          </button>
          {!candidateTableAvailable ? (
            <p className="mt-2 max-w-64 text-xs leading-5 text-muted">
              先に `0010_initial_data_review_workflow.sql` を適用してください。
            </p>
          ) : null}
        </form>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          { label: "候補", value: metrics.total },
          { label: "対象エリア", value: metrics.areas },
          { label: "公式URL", value: metrics.sourceUrls },
          { label: "Hidden固定", value: metrics.hiddenEvidence },
        ].map((item) => (
          <div className="rounded-md border border-line bg-surface p-3" key={item.label}>
            <p className="text-xs font-semibold text-muted">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <pre className="mt-5 max-h-72 overflow-auto rounded-md border border-line bg-surface p-4 text-xs leading-6 text-ink">
        {csv}
      </pre>
    </div>
  );
}

function InitialDataReviewWorkflowPanel({
  filters,
  workflow,
}: {
  filters: {
    decision: string;
    q: string;
    readiness: string;
  };
  workflow: AdminInitialDataReviewWorkflow;
}) {
  if (!workflow.available) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
        <h2 className="text-lg font-bold">候補審査DB</h2>
        <p className="mt-2">
          `initial_data_review_candidates` テーブルがまだ利用できません。Supabaseで `supabase/migrations/0010_initial_data_review_workflow.sql` を適用すると、候補ごとの審査状態を保存できます。
        </p>
      </div>
    );
  }

  const filteredCandidates = filterInitialDataCandidates(workflow.candidates, filters);

  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">候補審査DB</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            CSV候補を公開前の審査タスクとして管理します。ここでの「非公開投入へ」は公開承認ではなく、既存の投稿審査フローへ進める判断です。
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-bold text-action no-underline"
          href="/admin/quality"
        >
          品質キューを見る
        </Link>
      </div>

      <form className="mt-5 grid gap-3 rounded-md border border-line bg-surface p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          候補検索
          <input
            className="rounded-md border border-line bg-white px-3 py-2 font-normal"
            defaultValue={filters.q}
            name="q"
            placeholder="店名・住所・建物・エリア"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          判断
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal"
            defaultValue={filters.decision}
            name="decision"
          >
            <option value="all">すべて</option>
            {INITIAL_DATA_PUBLISH_DECISIONS.map((decision) => (
              <option key={decision} value={decision}>
                {getInitialDataPublishDecisionLabel(decision)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          投入状態
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal"
            defaultValue={filters.readiness}
            name="readiness"
          >
            <option value="all">すべて</option>
            <option value="ready">投入可能</option>
            <option value="blocked">未完了あり</option>
            <option value="linked">作成済み</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="h-10 rounded-md bg-action px-4 text-sm font-bold text-white" type="submit">
            絞り込み
          </button>
          <Link
            className="inline-flex h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-bold text-action no-underline"
            href="/admin/data"
          >
            解除
          </Link>
        </div>
      </form>

      <p className="mt-3 text-sm text-muted">
        表示中: {filteredCandidates.length}件 / 全候補: {workflow.candidates.length}件
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "候補", value: workflow.metrics.total },
          { label: "優先高", value: workflow.metrics.highPriority },
          { label: "出典未確認", value: workflow.metrics.sourceUnverified },
          { label: "法務未完了", value: workflow.metrics.legalPending },
          { label: "非公開投入待ち", value: workflow.metrics.importReady },
          { label: "不採用", value: workflow.metrics.rejected },
        ].map((item) => (
          <div className="rounded-md border border-line bg-surface p-3" key={item.label}>
            <p className="text-xs font-semibold text-muted">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.slice(0, 50).map((candidate) => (
            <InitialDataReviewCandidateCard
              candidate={candidate}
              key={candidate.id}
            />
          ))
        ) : (
          <EmptyState message="条件に一致する候補はありません。" />
        )}
      </div>
    </div>
  );
}

function filterInitialDataCandidates(
  candidates: AdminInitialDataReviewCandidate[],
  filters: { decision: string; q: string; readiness: string },
) {
  const normalizedQuery = filters.q.trim().toLowerCase();

  return candidates.filter((candidate) => {
    const readiness = getCandidateReadiness(candidate);
    const haystack = [
      candidate.observedArea,
      candidate.placeName,
      candidate.address,
      candidate.buildingName,
      candidate.floor,
      candidate.sourceTitle,
      candidate.publicSummary,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (normalizedQuery && !haystack.includes(normalizedQuery)) {
      return false;
    }

    if (filters.decision !== "all" && candidate.publishDecision !== filters.decision) {
      return false;
    }

    if (filters.readiness === "ready" && !readiness.canImport) {
      return false;
    }

    if (filters.readiness === "blocked" && (readiness.canImport || candidate.linkedReportId)) {
      return false;
    }

    if (filters.readiness === "linked" && !candidate.linkedReportId) {
      return false;
    }

    return true;
  });
}

function InitialDataReviewCandidateCard({
  candidate,
}: {
  candidate: AdminInitialDataReviewCandidate;
}) {
  const readiness = getCandidateReadiness(candidate);

  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
              優先 {getInitialDataPriorityLabel(candidate.reviewPriority)}
            </span>
            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
              {candidate.observedArea}
            </span>
            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
              {getInitialDataLegalReviewStatusLabel(candidate.legalReviewStatus)}
            </span>
            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
              {getInitialDataPublishDecisionLabel(candidate.publishDecision)}
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold text-ink">
            {candidate.placeName ?? candidate.address ?? "名称未確認"}
          </h3>
          <p className="mt-1 text-sm text-muted">{candidate.address ?? "住所未入力"}</p>
          <p className="mt-1 text-sm text-muted">
            {[candidate.buildingName, candidate.floor].filter(Boolean).join(" ") ||
              "建物・階数未確認"}
          </p>
          <p className="mt-3 text-sm leading-7 text-ink">{candidate.publicSummary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.riskTags.map((tag) => (
              <span
                className="rounded-md border border-line bg-white px-2 py-1 text-xs text-muted"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            <span>出典確認日: {candidate.sourceCheckedAt}</span>
            <span>更新: {formatDate(candidate.updatedAt)}</span>
            {candidate.sourceUrl ? (
              <a
                className="font-semibold text-action"
                href={candidate.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                出典を開く
              </a>
            ) : null}
            {candidate.linkedReportId ? (
              <Link
                className="font-semibold text-action"
                href={`/admin/reports/${candidate.linkedReportId}`}
              >
                作成済み投稿
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-md border border-line bg-white p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-bold text-ink">非公開投入チェック</h4>
              <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-bold text-muted">
                {readiness.score}/{readiness.total}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-action"
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
            <ul className="mt-3 grid gap-2 text-xs leading-5 text-muted">
              {readiness.items.map((item) => (
                <li className="flex items-start gap-2" key={item.label}>
                  <span
                    aria-hidden="true"
                    className={
                      item.done
                        ? "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white"
                        : "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line bg-white text-[10px] font-bold text-muted"
                    }
                  >
                    {item.done ? "✓" : "!"}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            {candidate.linkedReportId ? (
              <Link
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-bold text-action no-underline"
                href={`/admin/reports/${candidate.linkedReportId}`}
              >
                紐付け済み投稿を見る
              </Link>
            ) : (
              <form action={importInitialDataReviewCandidateAction} className="mt-3">
                <input name="candidate_id" type="hidden" value={candidate.id} />
                <button
                  className="h-10 w-full rounded-md bg-action px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-muted"
                  disabled={!readiness.canImport}
                  type="submit"
                >
                  非公開投稿を作成
                </button>
                {!readiness.canImport ? (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    未完了項目を保存すると、公開承認ではなく非公開投稿として作成できます。
                  </p>
                ) : null}
              </form>
            )}
          </div>

          <form
            action={updateInitialDataReviewCandidateAction}
            className="grid gap-3 rounded-md border border-line bg-white p-3 text-sm"
          >
            <input name="candidate_id" type="hidden" value={candidate.id} />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <label className="grid gap-1 font-semibold text-ink">
                優先度
                <select
                  className="rounded-md border border-line bg-white px-3 py-2 font-normal"
                  defaultValue={candidate.reviewPriority}
                  name="review_priority"
                >
                  {INITIAL_DATA_REVIEW_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {getInitialDataPriorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 font-semibold text-ink">
                法務・表現確認
                <select
                  className="rounded-md border border-line bg-white px-3 py-2 font-normal"
                  defaultValue={candidate.legalReviewStatus}
                  name="legal_review_status"
                >
                  {INITIAL_DATA_LEGAL_REVIEW_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getInitialDataLegalReviewStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 font-semibold text-ink">
                判断
                <select
                  className="rounded-md border border-line bg-white px-3 py-2 font-normal"
                  defaultValue={candidate.publishDecision}
                  name="publish_decision"
                >
                  {INITIAL_DATA_PUBLISH_DECISIONS.map((decision) => (
                    <option key={decision} value={decision}>
                      {getInitialDataPublishDecisionLabel(decision)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {[
              {
                checked: candidate.sourceVerified,
                label: "出典URL・確認日を確認",
                name: "source_verified",
              },
              {
                checked: candidate.publicSummaryChecked,
                label: "公開サマリーが独自要約",
                name: "public_summary_checked",
              },
              {
                checked: candidate.buildingChecked,
                label: "住所・建物・階数を確認",
                name: "building_checked",
              },
            ].map((item) => (
              <label className="flex items-start gap-2 text-sm text-ink" key={item.name}>
                <input
                  className="mt-1"
                  defaultChecked={item.checked}
                  name={item.name}
                  type="checkbox"
                />
                <span>{item.label}</span>
              </label>
            ))}

            <label className="grid gap-1 font-semibold text-ink">
              審査メモ
              <textarea
                className="min-h-24 rounded-md border border-line bg-white px-3 py-2 font-normal leading-6"
                defaultValue={candidate.reviewNote ?? ""}
                name="review_note"
              />
            </label>

            <button
              className="h-10 rounded-md bg-action px-4 text-sm font-bold text-white"
              type="submit"
            >
              審査状態を保存
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function getCandidateReadiness(candidate: AdminInitialDataReviewCandidate) {
  const items = [
    { done: candidate.sourceVerified, label: "出典URL・確認日を確認済み" },
    { done: candidate.publicSummaryChecked, label: "公開サマリーが独自要約" },
    { done: candidate.buildingChecked, label: "住所・建物・階数を確認済み" },
    {
      done: candidate.legalReviewStatus === "approved_for_import",
      label: "法務・表現確認が非公開投入可",
    },
    {
      done: candidate.publishDecision === "import_private",
      label: "判断が非公開投入へ",
    },
    {
      done: candidate.evidenceLevel === "Hidden" && ["pending", "needs_review"].includes(candidate.proposedStatus),
      label: "Hidden / 非公開ステータス固定",
    },
    { done: !candidate.linkedReportId, label: "未作成の候補" },
  ];
  const score = items.filter((item) => item.done).length;

  return {
    canImport: items.every((item) => item.done),
    items,
    percent: Math.round((score / items.length) * 100),
    score,
    total: items.length,
  };
}
