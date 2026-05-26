import { getObjectionStatusLabel, getStatusLabel } from "@/lib/admin/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  needs_review: "border-sky-200 bg-sky-50 text-sky-800",
  hidden: "border-slate-200 bg-slate-50 text-slate-700",
  open: "border-amber-200 bg-amber-50 text-amber-800",
  reviewing: "border-sky-200 bg-sky-50 text-sky-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  dismissed: "border-slate-200 bg-slate-50 text-slate-700",
};

export function StatusBadge({
  status,
  type = "report",
}: {
  status: string;
  type?: "report" | "objection";
}) {
  const label = type === "report" ? getStatusLabel(status) : getObjectionStatusLabel(status);
  const style = STATUS_STYLES[status] ?? "border-line bg-paper text-muted";

  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
