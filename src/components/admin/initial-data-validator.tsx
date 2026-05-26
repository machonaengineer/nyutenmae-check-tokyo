"use client";

import { useMemo, useState } from "react";
import { INITIAL_DATA_COLUMNS, validateInitialDataCsv } from "@/lib/initial-data-validation";

const sampleCsv = `${INITIAL_DATA_COLUMNS.join(",")}
external_review_trend,https://example.com,確認用サンプル,2026-05-27,新宿・歌舞伎町,店舗名未確認,東京都新宿区,,,料金説明,料金説明と会計内容の不一致報告あり,Hidden,投稿者の申告では料金説明と会計内容に不一致があったとのことです。,非公開メモ,pending,,`;

export function InitialDataValidator() {
  const [csv, setCsv] = useState(sampleCsv);
  const result = useMemo(() => validateInitialDataCsv(csv), [csv]);
  const errorCount = result.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;

  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        初期データCSV
        <textarea
          className="min-h-72 rounded-md border border-line bg-white px-3 py-2 font-mono text-xs font-normal leading-6 text-ink"
          onChange={(event) => setCsv(event.target.value)}
          value={csv}
        />
      </label>

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
