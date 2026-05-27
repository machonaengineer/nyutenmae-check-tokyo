"use client";

import { useActionState } from "react";
import { HONEYPOT_FIELD_NAME } from "@/lib/form-protection";
import {
  SPONSOR_BUDGET_OPTIONS,
  SPONSOR_TYPE_OPTIONS,
} from "@/lib/sponsor-inquiry";
import { submitSponsorInquiryAction } from "./actions";
import {
  createInitialSponsorInquiryFormState,
  type SponsorInquiryFormState,
} from "./form-state";

function getValue(state: SponsorInquiryFormState, field: string) {
  return state.values[field] ?? "";
}

function FieldError({
  state,
  field,
}: {
  state: SponsorInquiryFormState;
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
  required = false,
  type = "text",
}: {
  name: string;
  label: string;
  state: SponsorInquiryFormState;
  placeholder?: string;
  required?: boolean;
  type?: string;
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

export function SponsorInquiryForm() {
  const [state, formAction, isPending] = useActionState(
    submitSponsorInquiryAction,
    createInitialSponsorInquiryFormState(),
  );

  return (
    <form
      action={formAction}
      className="grid gap-6 rounded-md border border-line bg-white p-5 shadow-[0_12px_30px_rgb(23_32_42/0.05)]"
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

      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          label="組織名"
          name="organization_name"
          placeholder="例：株式会社〇〇"
          required
          state={state}
        />
        <TextInput
          label="担当者名"
          name="contact_name"
          placeholder="任意。公開されません"
          state={state}
        />
        <TextInput
          label="連絡用メールアドレス"
          name="contact_email"
          placeholder="公開されません"
          required
          state={state}
          type="email"
        />
        <TextInput
          label="WebサイトURL"
          name="website_url"
          placeholder="https://example.com"
          state={state}
          type="url"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          相談種別
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "sponsor_type")}
            name="sponsor_type"
            required
          >
            {SPONSOR_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError state={state} field="sponsor_type" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          想定予算
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "budget_range")}
            name="budget_range"
            required
          >
            {SPONSOR_BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError state={state} field="budget_range" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        相談内容
        <textarea
          className="min-h-40 rounded-md border border-line bg-white px-3 py-2 font-normal leading-7 text-ink"
          defaultValue={getValue(state, "message")}
          name="message"
          placeholder="掲載目的、希望時期、想定している支援内容、掲載独立性への理解を記入してください。"
          required
        />
        <FieldError state={state} field="message" />
      </label>

      <button
        className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-muted"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "送信中..." : "非公開で問い合わせる"}
      </button>
    </form>
  );
}
