import { updateObjectionStatusAction } from "@/app/admin/actions";
import { getObjectionStatusLabel, OBJECTION_STATUSES } from "@/lib/admin/types";

export function ObjectionStatusForm({
  objectionId,
  status,
}: {
  objectionId: string;
  status: string;
}) {
  return (
    <form action={updateObjectionStatusAction} className="flex flex-col gap-2 sm:flex-row">
      <input name="objection_id" type="hidden" value={objectionId} />
      <select
        className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink"
        defaultValue={status}
        name="status"
      >
        {OBJECTION_STATUSES.map((option) => (
          <option key={option} value={option}>
            {getObjectionStatusLabel(option)}
          </option>
        ))}
      </select>
      <button
        className="h-10 rounded-md bg-action px-4 text-sm font-semibold text-white"
        type="submit"
      >
        更新
      </button>
    </form>
  );
}
