export const DEFAULT_GA_ID = "G-GBGMP0T3M8";

export function getGaMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID;
}
