import { EVIDENCE_LEVEL_VALUES, REPORT_STATUSES } from "@/lib/admin/types";
import type { AdminReportDetail, AdminRiskTag } from "@/lib/admin/data";
import { updateReportAction } from "@/app/admin/actions";
import { getStatusLabel } from "@/lib/admin/types";

export function ReportEditForm({
  report,
  riskTags,
}: {
  report: AdminReportDetail;
  riskTags: AdminRiskTag[];
}) {
  return (
    <form action={updateReportAction} className="grid gap-5 rounded-md border border-line bg-surface p-5">
      <input name="report_id" type="hidden" value={report.id} />

      <label className="grid gap-2 text-sm font-semibold text-ink">
        公開サマリー
        <textarea
          className="min-h-44 rounded-md border border-line bg-white px-3 py-2 font-normal leading-7 text-ink"
          defaultValue={report.publicSummary}
          name="public_summary"
          required
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          証拠レベル
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={report.evidenceLevel}
            name="evidence_level"
          >
            {EVIDENCE_LEVEL_VALUES.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          ステータス
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={report.status}
            name="status"
          >
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-ink">リスクタグ</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {riskTags.map((tag) => (
            <label
              key={tag.id}
              className="flex items-start gap-3 rounded-md border border-line bg-white px-3 py-3 text-sm leading-6"
            >
              <input
                className="mt-1"
                defaultChecked={report.selectedRiskTagIds.includes(tag.id)}
                name="risk_tag_ids"
                type="checkbox"
                value={tag.id}
              />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white" type="submit">
        編集内容を保存
      </button>
    </form>
  );
}
