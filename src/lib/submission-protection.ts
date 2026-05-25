import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { HONEYPOT_FIELD_NAME } from "@/lib/form-protection";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type SubmissionKind = "report" | "objection";
type RateLimitKeyType = "ip" | "email" | "browser";

type RateLimitConfig = {
  windowMs: number;
  maxAttemptsByKeyType: Record<RateLimitKeyType, number>;
};

type RateLimitRow = {
  id: string;
  attempt_count: number;
  last_attempt_at: string;
  window_start: string;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; message: string; retryAfterSeconds: number };

const RATE_LIMITS: Record<SubmissionKind, RateLimitConfig> = {
  report: {
    windowMs: 15 * 60 * 1000,
    maxAttemptsByKeyType: {
      ip: 5,
      email: 2,
      browser: 3,
    },
  },
  objection: {
    windowMs: 15 * 60 * 1000,
    maxAttemptsByKeyType: {
      ip: 10,
      email: 3,
      browser: 5,
    },
  },
};

const BROWSER_RATE_LIMIT_COOKIE = "nt_submission_client_id";
const BROWSER_RATE_LIMIT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const RATE_LIMIT_MESSAGE =
  "短時間に複数回の送信がありました。時間を置いて再度お試しください。";

function getRateLimitSecret() {
  return (
    process.env.RATE_LIMIT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "local-development-rate-limit-secret"
  );
}

function hashRateLimitKey(kind: SubmissionKind, keyType: RateLimitKeyType, value: string) {
  return createHash("sha256")
    .update(getRateLimitSecret())
    .update(":")
    .update(kind)
    .update(":")
    .update(keyType)
    .update(":")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function parseForwardedFor(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function isHoneypotFilled(formData: FormData) {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}

export async function getClientIpForRateLimit() {
  const headerStore = await headers();
  return (
    headerStore.get("cf-connecting-ip")?.trim() ||
    parseForwardedFor(headerStore.get("x-forwarded-for")) ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function getBrowserKeyForRateLimit() {
  const cookieStore = await cookies();
  const existingValue = cookieStore.get(BROWSER_RATE_LIMIT_COOKIE)?.value;

  if (existingValue && /^[0-9a-f-]{36}$/i.test(existingValue)) {
    return existingValue;
  }

  const nextValue = randomUUID();
  cookieStore.set(BROWSER_RATE_LIMIT_COOKIE, nextValue, {
    httpOnly: true,
    maxAge: BROWSER_RATE_LIMIT_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return nextValue;
}

async function checkRateLimitKey(options: {
  kind: SubmissionKind;
  keyType: RateLimitKeyType;
  value: string;
}): Promise<RateLimitResult> {
  const config = RATE_LIMITS[options.kind];
  const maxAttempts = config.maxAttemptsByKeyType[options.keyType];
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);
  const keyHash = hashRateLimitKey(options.kind, options.keyType, options.value);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("submission_rate_limits")
    .select("id,attempt_count,last_attempt_at,window_start")
    .eq("form_kind", options.kind)
    .eq("key_type", options.keyType)
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    return { allowed: false, message: RATE_LIMIT_MESSAGE, retryAfterSeconds: 60 };
  }

  const row = data as RateLimitRow | null;

  if (!row || new Date(row.window_start) < windowStart) {
    const { error: upsertError } = await supabase.from("submission_rate_limits").upsert(
      {
        form_kind: options.kind,
        key_type: options.keyType,
        key_hash: keyHash,
        window_start: now.toISOString(),
        attempt_count: 1,
        last_attempt_at: now.toISOString(),
      },
      { onConflict: "form_kind,key_type,key_hash" },
    );

    if (upsertError) {
      return { allowed: false, message: RATE_LIMIT_MESSAGE, retryAfterSeconds: 60 };
    }

    return { allowed: true };
  }

  if (row.attempt_count >= maxAttempts) {
    const retryAfterSeconds = Math.max(
      60,
      Math.ceil(
        (new Date(row.window_start).getTime() + config.windowMs - now.getTime()) / 1000,
      ),
    );

    return { allowed: false, message: RATE_LIMIT_MESSAGE, retryAfterSeconds };
  }

  const { error: updateError } = await supabase
    .from("submission_rate_limits")
    .update({
      attempt_count: row.attempt_count + 1,
      last_attempt_at: now.toISOString(),
    })
    .eq("id", row.id);

  if (updateError) {
    return { allowed: false, message: RATE_LIMIT_MESSAGE, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}

export async function enforceSubmissionRateLimit(options: {
  kind: SubmissionKind;
  email: string;
}) {
  const ip = await getClientIpForRateLimit();
  const browserKey = await getBrowserKeyForRateLimit();
  const checks = await Promise.all([
    checkRateLimitKey({ kind: options.kind, keyType: "ip", value: ip }),
    checkRateLimitKey({ kind: options.kind, keyType: "email", value: options.email }),
    checkRateLimitKey({ kind: options.kind, keyType: "browser", value: browserKey }),
  ]);

  return checks.find((check): check is Extract<RateLimitResult, { allowed: false }> => !check.allowed) ?? { allowed: true };
}
