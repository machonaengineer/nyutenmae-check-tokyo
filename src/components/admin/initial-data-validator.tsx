"use client";

import { useActionState, useMemo, useState } from "react";
import {
  importInitialDataAction,
  type InitialDataImportState,
} from "@/app/admin/data/actions";
import { INITIAL_DATA_COLUMNS, validateInitialDataCsv } from "@/lib/initial-data-validation";

const sampleCsv = `${INITIAL_DATA_COLUMNS.join(",")}
external_review_trend,https://example.com,確認用サンプル,2026-05-27,新宿・歌舞伎町,店舗名未確認,東京都新宿区,サンプルビル,3F,料金説明,料金説明と会計内容の不一致報告あり,Hidden,投稿者の申告では料金説明と会計内容に不一致があったとのことです。,非公開メモ,pending,,`;

const initialImportState: InitialDataImportState = {
  status: "idle",
  message: "",
  importedCount: 0,
  skippedCount: 0,
  errors: [],
};

export function InitialDataValidator() {
  const [csv, setCsv] = useState(sampleCsv);
  const [importState, importAction, isImporting] = useActionState(
    importInitialDataAction,
    initialImportState,
  );
  const result = useMemo(() => validateInitialDataCsv(csv), [csv]);
  const errorCount = result.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;

  return (
    <div className="grid gap-5">
      <form action={importAction} className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          初期データCSV
          <textarea
            className="min-h-72 rounded-md border border-line bg-white px-3 py-2 font-mono text-xs font-normal leading-6 text-ink"
            name="csv"
            onChange={(event) => setCsv(event.target.value)}
            value={csv}
          />
        </label>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          投入すると、各行は管理者審査用の非公開投稿として作成されます。
          `status` は pending / needs_review のみ、`evidence_level` は Hidden のみ許可します。
          承認公開は投稿詳細画面で人間が確認してから行ってください。
          店名変更の可能性があるため、住所、建物名、階数も可能な範囲で確認してください。
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-bold text-white transition hover:bg-action-strong disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isImporting || errorCount > 0}
            type="submit"
          >
            {isImporting ? "投入中..." : "非公開デフォルトで投入する"}
          </button>
          <p className="text-xs leading-5 text-muted">
            エラーがあるCSVは投入できません。警告は人間が確認してください。
          </p>
        </div>
      </form>

      {importState.status !== "idle" ? (
        <div
          className={
            importState.status === "success"
              ? "rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          <p className="font-bold">{importState.message}</p>
          <p className="mt-1">
            投入: {importState.importedCount}件 / 重複スキップ:{" "}
            {importState.skippedCount}件
          </p>
          {importState.errors.length > 0 ? (
            <ul className="mt-3 grid gap-1">
              {importState.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "行数", value: result.rowCount },
          { label: "エラー", value: errorCount },
          { label: "警告", value: warningCount },
          {
            label: "投入可否",
            value: errorCount === 0 ? "要確認" : "修正必要",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-line bg-white p-4">
            <p className="text-xs font-semibold text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryTable title="status集計" values={result.statusCounts} />
        <SummaryTable title="証拠レベル集計" values={result.evidenceCounts} />
      </div>

      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-base font-bold text-ink">検証結果</h2>
        </div>
        {result.issues.length > 0 ? (
          <div className="divide-y divide-line">
            {result.issues.slice(0, 100).map((issue, index) => (
              <div key={`${issue.row}-${issue.column}-${index}`} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[90px_150px_1fr]">
                <span
                  className={
                    issue.severity === "error"
                      ? "font-bold text-red-700"
                      : "font-bold text-amber-700"
                  }
                >
                  {issue.severity === "error" ? "エラー" : "警告"}
                </span>
                <span className="text-muted">
                  {issue.row}行目 / {issue.column}
                </span>
                <span className="text-ink">{issue.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-5 text-sm leading-6 text-muted">
            自動検証上の問題はありません。投入前に人間が出典、表現、公開可否を確認してください。
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryTable({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const entries = Object.entries(values);

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {entries.length > 0 ? (
        <dl className="mt-3 grid gap-2 text-sm">
          {entries.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-muted">{label}</dt>
              <dd className="font-bold text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-muted">データなし</p>
      )}
    </div>
  );
}
