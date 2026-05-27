type SiteSearchFormProps = {
  defaultValue?: string;
  inputId?: string;
  variant?: "compact" | "wide";
};

export function SiteSearchForm({
  defaultValue = "",
  inputId,
  variant = "compact",
}: SiteSearchFormProps) {
  const isWide = variant === "wide";
  const searchInputId = inputId ?? (isWide ? "site-search-wide" : "site-search");

  return (
    <form
      action="/search"
      className={
        isWide
          ? "grid gap-2 sm:grid-cols-[1fr_auto]"
          : "flex w-full max-w-sm items-center gap-2"
      }
      role="search"
    >
      <label className="sr-only" htmlFor={searchInputId}>
        店舗名・住所・建物名で検索
      </label>
      <input
        className="h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-action focus:ring-2 focus:ring-action/15"
        defaultValue={defaultValue}
        id={searchInputId}
        maxLength={80}
        name="q"
        placeholder="店舗名・住所・ビル名で検索"
        type="search"
      />
      <button
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-action"
        type="submit"
      >
        検索
      </button>
    </form>
  );
}
