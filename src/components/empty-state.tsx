export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-surface px-5 py-8 text-center text-sm leading-7 text-muted">
      {message}
    </div>
  );
}
