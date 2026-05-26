export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgb(23_32_42/0.04)]">
      <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-action/70" />
      <p className="text-sm font-semibold leading-7 text-ink">{message}</p>
      <p className="mt-2 text-xs leading-6 text-muted">
        新しい送信があると、この画面に審査対象として表示されます。
      </p>
    </div>
  );
}
