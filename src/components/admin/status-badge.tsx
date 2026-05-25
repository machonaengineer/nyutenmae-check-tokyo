import { getObjectionStatusLabel, getStatusLabel } from "@/lib/admin/types";

export function StatusBadge({
  status,
  type = "report",
}: {
  status: string;
  type?: "report" | "objection";
}) {
  const label = type === "report" ? getStatusLabel(status) : getObjectionStatusLabel(status);

  return (
    <span className="inline-flex rounded-md border border-line bg-paper px-2 py-1 text-xs font-semibold text-muted">
      {label}
    </span>
  );
}
