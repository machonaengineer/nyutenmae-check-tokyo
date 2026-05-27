"use client";

import { useActionState, useMemo, useState } from "react";
import {
  stageInitialDataCandidatesAction,
  type InitialDataCandidateStageState,
} from "@/app/admin/data/actions";
import { INITIAL_DATA_COLUMNS, validateInitialDataCsv } from "@/lib/initial-data-validation";
import {
  getInitialDataPriorityLabel,
  INITIAL_DATA_REVIEW_PRIORITIES,
} from "@/lib/admin/types";

const sampleCsv = `${INITIAL_DATA_COLUMNS.join(",")}
news,https://example.com/source,確認用サンプル,2026-05-27,新宿・歌舞伎町,店舗名未確認,東京都新宿区,サンプルビル,3F,料金説明,料金説明と会計内容の不一致報告あり,Hidden,報道等の出典では料金説明と会計内容に関する注意情報が確認されています。公開前に現在状況と表現を確認します。,非公開メモ,needs_review,,`;

const initialStageState: InitialDataCandidateStageState = {
  status: "idle",
  message: "",
  stagedCount: 0,
  skippedCount: 0,
  errors: [],
};

export function InitialDataCandidateStager() {
  const [csv, setCsv] = useState(sampleCsv);
  const [stageState, stageAction, isStaging] = useActionState(
    stageInitialDataCandidatesAction,
    initialStageState,
  );
  const result = useMemo(() => validateInitialDataCsv(csv), [csv]);
  const errorCount = result.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;

  return (
    <div className="rounded-md border border-line bg-white p-5">
      <h2 className="text-lg font-bold text-ink">候補CSVを審査DBへ登録</h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        ここでは公開投稿を作らず、管理者限定の審査候補として保存します。実名入りCSVはGit管理せず、この欄へ貼り付けて扱います。
      </p>

      <form action={stageAction} className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          登録時の優先度
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue="medium"
            name="review_priority"
          >
            {INITIAL_DATA_REVIEW_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {getInitialDataPriorityLabel(priority)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          初期データ候補CSV
          <textarea
            className="min-h-56 rounded-md border border-line bg-white px-3 py-2 font-mono text-xs font-normal leading-6 text-ink"
            name="csv"
            onChange={(event) => setCsv(event.target.value)}
            value={csv}
          />
        </label>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          登録先は `initial_data_review_candidates` です。公開ページには表示されず、非公開投稿の作成や承認は別ステップで行います。
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-bold text-white transition hover:bg-action-strong disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isStaging || errorCount > 0}
            type="submit"
          >
            {isStaging ? "登録中..." : "審査DBへ登録する"}
          </button>
          <p className="text-xs leading-5 text-muted">
            エラーがあるCSVは登録できません。警告は登録前に人間が確認してください。
          </p>
        </div>
      </form>

      {stageState.status !== "idle" ? (
        <div
          className={
            stageState.status === "success"
              ? "mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              : "mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          <p className="font-bold">{stageState.message}</p>
          <p className="mt-1">
            登録: {stageState.stagedCount}件 / 重複スキップ:{" "}
            {stageState.skippedCount}件
          </p>
          {stageState.errors.length > 0 ? (
            <ul className="mt-3 grid gap-1">
              {stageState.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          { label: "行数", value: result.rowCount },
          { label: "エラー", value: errorCount },
          { label: "警告", value: warningCount },
          { label: "登録可否", value: errorCount === 0 ? "要確認" : "修正必要" },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-line bg-surface p-3">
            <p className="text-xs font-semibold text-muted">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
