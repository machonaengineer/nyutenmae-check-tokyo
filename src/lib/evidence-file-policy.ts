export const ALLOWED_EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const ALLOWED_EVIDENCE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
] as const;

export const EXTENSIONS_BY_MIME_TYPE: Record<
  (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number],
  readonly string[]
> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/heic": ["heic"],
  "image/heif": ["heif", "heic"],
};

export function getEvidenceFileExtension(fileName: string) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match?.[1]?.toLowerCase() ?? "";
}

export function isAllowedEvidenceMimeType(
  value: string,
): value is (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number] {
  return ALLOWED_EVIDENCE_MIME_TYPES.includes(
    value as (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number],
  );
}

export function isAllowedEvidenceExtension(value: string) {
  return ALLOWED_EVIDENCE_EXTENSIONS.includes(
    value.toLowerCase() as (typeof ALLOWED_EVIDENCE_EXTENSIONS)[number],
  );
}

export function isMimeExtensionPairAllowed(fileName: string, mimeType: string) {
  if (!isAllowedEvidenceMimeType(mimeType)) {
    return false;
  }

  const extension = getEvidenceFileExtension(fileName);
  return EXTENSIONS_BY_MIME_TYPE[mimeType].includes(extension);
}

export function getCanonicalExtensionForMimeType(
  mimeType: (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number],
) {
  return EXTENSIONS_BY_MIME_TYPE[mimeType][0];
}
