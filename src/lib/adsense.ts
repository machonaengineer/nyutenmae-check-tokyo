export type AdsensePlacement = "area" | "checklist" | "support";

const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d{16}$/;
const ADSENSE_PUBLISHER_PATTERN = /^pub-\d{16}$/;
const ADSENSE_SLOT_PATTERN = /^\d{6,24}$/;

const slotEnvByPlacement: Record<AdsensePlacement, string | undefined> = {
  area: process.env.NEXT_PUBLIC_ADSENSE_SLOT_AREA,
  checklist: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHECKLIST,
  support: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SUPPORT,
};

export function isAdsenseEnabled() {
  return process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
}

export function isAdsenseVerificationEnabled() {
  return process.env.NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED === "true";
}

export function shouldLoadAdsenseScript() {
  return isAdsenseEnabled() || isAdsenseVerificationEnabled();
}

export function getAdsenseClient() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();

  if (!client || !ADSENSE_CLIENT_PATTERN.test(client)) {
    return null;
  }

  return client;
}

export function getAdsenseSlotForPlacement(placement: AdsensePlacement) {
  const slot = slotEnvByPlacement[placement]?.trim();

  if (!slot || !ADSENSE_SLOT_PATTERN.test(slot)) {
    return null;
  }

  return slot;
}

export function getAdsTxtPublisherId() {
  const explicitPublisherId = process.env.ADS_TXT_GOOGLE_PUBLISHER_ID?.trim();

  if (explicitPublisherId && ADSENSE_PUBLISHER_PATTERN.test(explicitPublisherId)) {
    return explicitPublisherId;
  }

  const client = getAdsenseClient();

  if (!client) {
    return null;
  }

  return client.replace(/^ca-/, "");
}
