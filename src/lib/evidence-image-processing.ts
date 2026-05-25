import "server-only";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import {
  getCanonicalExtensionForMimeType,
  isAllowedEvidenceMimeType,
  isMimeExtensionPairAllowed,
} from "@/lib/evidence-file-policy";

type ProcessedEvidenceFile = {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  fileSizeBytes: number;
  storageExtension: string;
};

function detectImageMimeType(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brandBytes = buffer.subarray(8, Math.min(buffer.length, 32)).toString("ascii");
    if (/hei[cfmxs]|mif1|msf1/.test(brandBytes)) {
      return brandBytes.includes("heif") || brandBytes.includes("mif1")
        ? "image/heif"
        : "image/heic";
    }
  }

  return null;
}

function stripJpegMetadata(buffer: Buffer) {
  if (detectImageMimeType(buffer) !== "image/jpeg") {
    return buffer;
  }

  const chunks: Buffer[] = [buffer.subarray(0, 2)];
  let offset = 2;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xda || marker === 0xd9) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    const length = buffer.readUInt16BE(offset + 2);
    const nextOffset = offset + 2 + length;

    if (length < 2 || nextOffset > buffer.length) {
      return buffer;
    }

    if (marker !== 0xe1) {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;
  }

  return Buffer.concat(chunks);
}

function stripPngMetadata(buffer: Buffer) {
  if (detectImageMimeType(buffer) !== "image/png") {
    return buffer;
  }

  const metadataChunks = new Set(["eXIf", "tEXt", "iTXt", "zTXt"]);
  const chunks: Buffer[] = [buffer.subarray(0, 8)];
  let offset = 8;

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const nextOffset = offset + 12 + length;

    if (nextOffset > buffer.length) {
      return buffer;
    }

    if (!metadataChunks.has(type)) {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;

    if (type === "IEND") {
      break;
    }
  }

  return Buffer.concat(chunks);
}

function stripWebpMetadata(buffer: Buffer) {
  if (detectImageMimeType(buffer) !== "image/webp") {
    return buffer;
  }

  const chunks: Buffer[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const paddedSize = size + (size % 2);
    const nextOffset = offset + 8 + paddedSize;

    if (nextOffset > buffer.length) {
      return buffer;
    }

    if (type !== "EXIF" && type !== "XMP ") {
      chunks.push(buffer.subarray(offset, nextOffset));
    }

    offset = nextOffset;
  }

  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.length + 4, 4);
  header.write("WEBP", 8, "ascii");
  return Buffer.concat([header, body]);
}

function stripSupportedMetadata(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return stripJpegMetadata(buffer);
  }

  if (mimeType === "image/png") {
    return stripPngMetadata(buffer);
  }

  if (mimeType === "image/webp") {
    return stripWebpMetadata(buffer);
  }

  return buffer;
}

export async function processEvidenceFile(file: File): Promise<ProcessedEvidenceFile> {
  if (!isAllowedEvidenceMimeType(file.type) || !isMimeExtensionPairAllowed(file.name, file.type)) {
    throw new Error("Unsupported evidence image type.");
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const detectedMimeType = detectImageMimeType(originalBuffer);

  if (detectedMimeType !== file.type) {
    throw new Error("Evidence image content does not match the declared MIME type.");
  }

  const strippedBuffer = stripSupportedMetadata(originalBuffer, file.type);
  const storageExtension = getCanonicalExtensionForMimeType(file.type);
  const fileName = `${randomUUID()}.${storageExtension}`;

  return {
    buffer: strippedBuffer,
    contentType: file.type,
    fileName,
    fileSizeBytes: strippedBuffer.length,
    storageExtension,
  };
}
