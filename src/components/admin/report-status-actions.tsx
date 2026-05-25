import { setReportStatusAction } from "@/app/admin/actions";

const statusActions = [
  { status: "approved", label: "承認" },
  { status: "hidden", label: "非公開" },
  { status: "needs_review", label: "差し戻し" },
  { status: "rejected", label: "却下" },
] as const;

export function ReportStatusActions({ reportId }: { reportId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusActions.map((action) => (
        <form key={action.status} action={setReportStatusAction}>
          <input name="report_id" type="hidden" value={reportId} />
          <input name="status" type="hidden" value={action.status} />
          <button
            className="h-10 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-paper"
            type="submit"
          >
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}
