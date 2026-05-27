"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  DANGEROUS_EXPRESSION_NOTICE,
  getDangerousFieldLabels,
  REPORT_TEXT_FIELD_LABELS,
  SAFE_EXPRESSION_EXAMPLES,
} from "@/lib/content-safety";
import { HONEYPOT_FIELD_NAME } from "@/lib/form-protection";
import { REPORT_CONTACT_EMAIL_FIELD } from "@/lib/report-form";
import type { FormOption } from "@/lib/report-options";
import { submitReportAction } from "../new/actions";
import {
  createInitialReportFormState,
  initialReportFormState,
  type ReportFormState,
} from "../new/form-state";

type QuickReportFormProps = {
  areas: FormOption[];
  defaultValues?: ReportFormState["values"];
  riskTags: FormOption[];
};

function getValue(state: ReportFormState, field: string) {
  const value = state.values[field];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function hasValue(state: ReportFormState, field: string, value: string) {
  const currentValue = state.values[field];

  if (Array.isArray(currentValue)) {
    return currentValue.includes(value);
  }

  return currentValue === value;
}

function FieldError({
  field,
  state,
}: {
  field: string;
  state: ReportFormState;
}) {
  const messages = state.errors[field];

  if (!messages?.length) {
    return null;
  }

  return (
    <div className="grid gap-1 text-xs font-normal leading-5 text-red-700">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

export function QuickReportForm({
  areas,
  defaultValues,
  riskTags,
}: QuickReportFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitReportAction,
    defaultValues ? createInitialReportFormState(defaultValues) : initialReportFormState,
  );
  const [dangerousFieldLabels, setDangerousFieldLabels] = useState<string[]>([]);

  function updateDangerousExpressionNotice(form: HTMLFormElement) {
    setDangerousFieldLabels(
      getDangerousFieldLabels(new FormData(form), REPORT_TEXT_FIELD_LABELS),
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-6 rounded-md border border-line bg-white p-5 shadow-[0_12px_30px_rgb(23_32_42/0.05)]"
      onChange={(event) => updateDangerousExpressionNotice(event.currentTarget)}
      onInput={(event) => updateDangerousExpressionNotice(event.currentTarget)}
    >
      <div aria-hidden="true" className="hidden">
        <label>
          会社Webサイト
          <input
            autoComplete="off"
            name={HONEYPOT_FIELD_NAME}
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      {dangerousFieldLabels.length > 0 ? (
        <div
          aria-live="polite"
          className="rounded-md border border-caution bg-caution-soft px-4 py-3 text-sm leading-7 text-ink"
        >
          <p className="font-semibold">公開審査で修正または非公開になる可能性があります。</p>
          <p className="mt-1">{DANGEROUS_EXPRESSION_NOTICE}</p>
          <p className="mt-2 text-muted">
            対象項目: {dangerousFieldLabels.join("、")}
          </p>
          <p className="mt-2 text-muted">
            推奨表現: {SAFE_EXPRESSION_EXAMPLES.join(" / ")}
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          対象エリア
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "area_slug")}
            name="area_slug"
            required
          >
            <option value="">選択してください</option>
            {areas.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
          <FieldError field="area_slug" state={state} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          店舗名または場所の手がかり
          <input
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "shop_name")}
            name="shop_name"
            placeholder="例：店名、建物名、看板の一部"
            required
          />
          <FieldError field="shop_name" state={state} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          住所
          <input
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "address")}
            name="address"
            placeholder="わかる範囲で入力"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          建物名・階数
          <input
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "building_name")}
            name="building_name"
            placeholder="例：〇〇ビル 3F"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          客引き経由の来店でしたか
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "was_solicited")}
            name="was_solicited"
          >
            <option value="">不明・未選択</option>
            <option value="true">はい</option>
            <option value="false">いいえ</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          実際の会計金額
          <input
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "actual_billed_amount")}
            inputMode="numeric"
            name="actual_billed_amount"
            placeholder="例：30000"
            type="number"
          />
          <FieldError field="actual_billed_amount" state={state} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        何がありましたか
        <textarea
          className="min-h-36 rounded-md border border-line bg-white px-3 py-2 font-normal leading-7 text-ink"
          defaultValue={getValue(state, "public_summary")}
          name="public_summary"
          placeholder="料金説明、会計内容、明細提示、退店時対応などを、断定を避けて30文字以上で記入してください。"
          required
        />
        <FieldError field="public_summary" state={state} />
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-ink">近い内容</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {riskTags.slice(0, 8).map((tag) => (
            <label
              className="flex items-start gap-3 rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 transition hover:border-action/40 hover:bg-action/5"
              key={tag.value}
            >
              <input
                className="mt-1"
                defaultChecked={hasValue(state, "risk_tags", tag.value)}
                name="risk_tags"
                type="checkbox"
                value={tag.value}
              />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        連絡用メールアドレス
        <input
          className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
          defaultValue={getValue(state, REPORT_CONTACT_EMAIL_FIELD)}
          name={REPORT_CONTACT_EMAIL_FIELD}
          placeholder="公開されません"
          required
          type="email"
        />
        <FieldError field={REPORT_CONTACT_EMAIL_FIELD} state={state} />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <button
          className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-muted"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "送信中..." : "非公開で送信する"}
        </button>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          href="/reports/new"
        >
          詳細フォームへ
        </Link>
      </div>
    </form>
  );
}
