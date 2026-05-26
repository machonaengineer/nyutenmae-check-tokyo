import Link from "next/link";
import { getAdsenseClient, getAdsenseSlotForPlacement, isAdsenseEnabled } from "@/lib/adsense";
import { AdsenseUnit } from "@/components/growth/adsense-unit";

type MonetizationSlotProps = {
  placement: "checklist" | "support" | "area";
};

function getPrimaryHref() {
  return process.env.NEXT_PUBLIC_SPONSOR_INQUIRY_URL || "/support";
}

export function MonetizationSlot({ placement }: MonetizationSlotProps) {
  if (process.env.NEXT_PUBLIC_MONETIZATION_ENABLED !== "true") {
    return null;
  }

  const adsenseClient = getAdsenseClient();
  const adsenseSlot = getAdsenseSlotForPlacement(placement);
  const shouldShowAdsense = isAdsenseEnabled() && adsenseClient && adsenseSlot;
  const supportHref = process.env.NEXT_PUBLIC_SUPPORT_URL;
  const primaryHref = getPrimaryHref();
  const supportLabel =
    placement === "area"
      ? "このエリアの安全な入店前確認を支援"
      : "入店前確認の情報整備を支援";
  const heading = shouldShowAdsense ? "広告" : supportLabel;
  const description = shouldShowAdsense
    ? "広告表示は公開情報の順位、リスクタグ、証拠レベル、審査判断に影響しません。"
    : "支援表示は公開情報の順位、リスクタグ、証拠レベル、審査判断に影響しません。";

  return (
    <aside className="rounded-md border border-line bg-white px-5 py-4 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-bold text-ink">{heading}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
        </div>
        {shouldShowAdsense ? (
          <AdsenseUnit
            client={adsenseClient}
            label="広告枠"
            slot={adsenseSlot}
          />
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
              href={primaryHref}
            >
              支援について確認
            </Link>
            {supportHref ? (
              <a
                className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
                href={supportHref}
                rel="noreferrer"
                target="_blank"
              >
                支援リンクを開く
              </a>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
