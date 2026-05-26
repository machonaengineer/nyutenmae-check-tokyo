"use client";

import { useActionState, useState } from "react";
import {
  DANGEROUS_EXPRESSION_NOTICE,
  getDangerousFieldLabels,
  OBJECTION_TEXT_FIELD_LABELS,
  SAFE_EXPRESSION_EXAMPLES,
} from "@/lib/content-safety";
import { HONEYPOT_FIELD_NAME } from "@/lib/form-protection";
import {
  OBJECTION_REASON_OPTIONS,
  OBJECTION_SUPPLEMENTAL_NOTE_FIELD,
} from "@/lib/objection-form";
import { submitObjectionAction } from "./actions";
import {
  createInitialObjectionFormState,
  type ObjectionFormState,
} from "./form-state";

type ObjectionFormProps = {
  defaultReportId?: string;
  defaultTargetUrl?: string;
};

function getValue(state: ObjectionFormState, field: string) {
  return state.values[field] ?? "";
}

function FieldError({
  state,
  field,
}: {
  state: ObjectionFormState;
  field: string;
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

function TextInput({
  name,
  label,
  state,
  placeholder,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  state: ObjectionFormState;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input
        className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
        defaultValue={getValue(state, name)}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      <FieldError state={state} field={name} />
    </label>
  );
}

function TextArea({
  name,
  label,
  state,
  placeholder,
  required = false,
}: {
  name: string;
  label: string;
  state: ObjectionFormState;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <textarea
        className="min-h-36 rounded-md border border-line bg-white px-3 py-2 font-normal leading-7 text-ink"
        defaultValue={getValue(state, name)}
        name={name}
        placeholder={placeholder}
        required={required}
      />
      <FieldError state={state} field={name} />
    </label>
  );
}

export function ObjectionForm({
  defaultReportId = "",
  defaultTargetUrl = "",
}: ObjectionFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitObjectionAction,
    createInitialObjectionFormState({
      report_id: defaultReportId,
      target_url: defaultTargetUrl,
    }),
  );
  const [dangerousFieldLabels, setDangerousFieldLabels] = useState<string[]>([]);

  function updateDangerousExpressionNotice(form: HTMLFormElement) {
    setDangerousFieldLabels(
      getDangerousFieldLabels(new FormData(form), OBJECTION_TEXT_FIELD_LABELS),
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-6 rounded-md border border-line bg-surface p-5"
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

      {state.status === "success" && state.message ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-7 text-green-800">
          {state.message}
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      {dangerousFieldLabels.length > 0 ? (
        <div
          aria-live="polite"
          className="rounded-md border border-caution bg-caution-soft px-4 py-3 text-sm leading-7 text-ink"
          data-testid="objection-dangerous-expression-warning"
        >
          <p className="font-semibold">確認依頼として扱いにくい表現が含まれています。</p>
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
        <TextInput
          label="対象URLまたは投稿ID"
          name="target_url"
          placeholder="/places/... または対象ページURL"
          state={state}
        />
        <TextInput
          label="投稿ID"
          name="report_id"
          placeholder="分かる場合のみ"
          state={state}
        />
        <TextInput
          label="申立て者名"
          name="requester_name"
          placeholder="任意。公開されません"
          state={state}
        />
        <TextInput
          label="連絡用メールアドレス"
          name="requester_email"
          placeholder="公開されません"
          required
          state={state}
          type="email"
        />
      </div>

      <TextInput
        label="対象との関係"
        name="requester_relationship"
        placeholder="例：店舗関係者、掲載対象の関係者、投稿者本人など"
        state={state}
      />

      <label className="grid gap-2 text-sm font-semibold text-ink">
        申立て種別
        <select
          className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
          defaultValue={getValue(state, "reason_category")}
          name="reason_category"
          required
        >
          {OBJECTION_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError state={state} field="reason_category" />
      </label>

      <TextArea
        label="申立て内容"
        name="details"
        placeholder="確認が必要な箇所、相違があると考える理由、確認可能な資料の有無を記入してください。"
        required
        state={state}
      />

      <TextArea
        label="補足"
        name={OBJECTION_SUPPLEMENTAL_NOTE_FIELD}
        placeholder="公開を希望しない補足があれば記入してください。"
        state={state}
      />

      <button
        className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-muted"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "送信中..." : "非公開で申立てを送信する"}
      </button>
    </form>
  );
}
