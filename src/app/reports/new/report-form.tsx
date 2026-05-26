"use client";

import { useActionState, useState } from "react";
import {
  DANGEROUS_EXPRESSION_NOTICE,
  getDangerousFieldLabels,
  REPORT_TEXT_FIELD_LABELS,
  SAFE_EXPRESSION_EXAMPLES,
} from "@/lib/content-safety";
import { HONEYPOT_FIELD_NAME } from "@/lib/form-protection";
import {
  FEE_EXPLANATION_OPTIONS,
  getEvidenceAcceptAttribute,
  MAX_EVIDENCE_FILES,
  PAYMENT_METHOD_OPTIONS,
  REPORT_CONTACT_EMAIL_FIELD,
  REPORT_SUPPLEMENTAL_NOTE_FIELD,
} from "@/lib/report-form";
import type { FormOption } from "@/lib/report-options";
import { submitReportAction } from "./actions";
import { initialReportFormState, type ReportFormState } from "./form-state";

type ReportFormProps = {
  areas: FormOption[];
  riskTags: FormOption[];
  maxUploadMb: number;
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
  state,
  field,
}: {
  state: ReportFormState;
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

function BooleanSelect({
  name,
  label,
  state,
}: {
  name: string;
  label: string;
  state: ReportFormState;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <select
        className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
        name={name}
        defaultValue={getValue(state, name)}
      >
        <option value="">不明・未選択</option>
        <option value="true">はい</option>
        <option value="false">いいえ</option>
      </select>
      <FieldError state={state} field={name} />
    </label>
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
  state: ReportFormState;
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
  state: ReportFormState;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <textarea
        className="min-h-32 rounded-md border border-line bg-white px-3 py-2 font-normal leading-7 text-ink"
        defaultValue={getValue(state, name)}
        name={name}
        placeholder={placeholder}
        required={required}
      />
      <FieldError state={state} field={name} />
    </label>
  );
}

export function ReportForm({ areas, riskTags, maxUploadMb }: ReportFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitReportAction,
    initialReportFormState,
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
      className="grid gap-8 rounded-md border border-line bg-white p-5 shadow-[0_12px_30px_rgb(23_32_42/0.05)]"
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
          data-testid="dangerous-expression-warning"
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

      <section className="grid gap-5">
        <div>
          <h2 className="text-lg font-bold text-ink">基本情報</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            投稿は非公開で保存され、管理者確認後に公開可否を判断します。
          </p>
        </div>

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
          <FieldError state={state} field="area_slug" />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="店舗名または場所の手がかり"
            name="shop_name"
            placeholder="例：店舗名、通り名、建物名など"
            required
            state={state}
          />
          <TextInput
            label="住所"
            name="address"
            placeholder="わかる範囲で入力"
            state={state}
          />
          <TextInput
            label="建物名"
            name="building_name"
            placeholder="例：〇〇ビル"
            state={state}
          />
          <TextInput label="階数" name="floor" placeholder="例：3F" state={state} />
          <TextInput
            label="Google Maps URL"
            name="google_maps_url"
            placeholder="https://maps.google.com/..."
            type="url"
            state={state}
          />
          <TextInput
            label="来店日時"
            name="visited_at"
            type="datetime-local"
            state={state}
          />
          <TextInput
            label="人数"
            name="party_size"
            placeholder="例：2"
            type="number"
            state={state}
          />
          <TextInput
            label="実際の会計金額"
            name="actual_billed_amount"
            placeholder="例：30000"
            type="number"
            state={state}
          />
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="text-lg font-bold text-ink">報告内容</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            料金説明、会計内容、明細提示、退店時対応に関わる範囲で記入してください。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <BooleanSelect label="客引き経由の来店でしたか" name="was_solicited" state={state} />
          <BooleanSelect
            label="入店前に料金説明がありましたか"
            name="price_explained_before_entry"
            state={state}
          />
          <BooleanSelect label="領収書はありましたか" name="receipt_available" state={state} />
          <BooleanSelect
            label="明細は提示されましたか"
            name="itemized_bill_available"
            state={state}
          />
          <BooleanSelect
            label="会計時に威圧感を覚えましたか"
            name="felt_intimidated"
            state={state}
          />
          <BooleanSelect label="同行者はいましたか" name="had_companions" state={state} />
        </div>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          料金説明の状況
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "fee_explanation_status")}
            name="fee_explanation_status"
          >
            {FEE_EXPLANATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError state={state} field="fee_explanation_status" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          支払い方法
          <select
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            defaultValue={getValue(state, "payment_method")}
            name="payment_method"
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError state={state} field="payment_method" />
        </label>

        <TextArea
          label="客引き時の説明"
          name="solicitation_description"
          placeholder="説明された料金、時間、条件など"
          state={state}
        />
        <TextArea
          label="店内での説明"
          name="explanation_inside_store"
          placeholder="店内で追加説明があった場合は記入してください。"
          state={state}
        />
        <TextArea
          label="注文内容"
          name="ordered_items"
          placeholder="覚えている範囲で記入してください。"
          state={state}
        />
        <TextArea
          label="会計時対応"
          name="checkout_response"
          placeholder="会計確認、説明、明細提示に関する経緯"
          state={state}
        />
        <TextArea
          label="退店時対応"
          name="exit_response"
          placeholder="退店時の対応に関する経緯"
          state={state}
        />
        <TextArea
          label="公開用の報告概要"
          name="public_summary"
          placeholder="断定を避け、確認できる範囲で記入してください。"
          required
          state={state}
        />
        <TextArea
          label="管理者向け補足"
          name={REPORT_SUPPLEMENTAL_NOTE_FIELD}
          placeholder="公開しない補足があれば記入してください。"
          state={state}
        />
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="text-lg font-bold text-ink">相談状況</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            公開時は必要な範囲だけを扱い、個人情報は一般公開しません。
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <BooleanSelect label="警察に相談しましたか" name="consulted_police" state={state} />
          <BooleanSelect
            label="消費生活センターに相談しましたか"
            name="consulted_consumer_center"
            state={state}
          />
          <BooleanSelect
            label="カード会社に相談しましたか"
            name="consulted_card_company"
            state={state}
          />
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="text-lg font-bold text-ink">リスクタグと証拠画像</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            証拠画像は非公開Storageに保存し、管理者確認用として扱います。
          </p>
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold text-ink">該当するタグ</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {riskTags.map((tag) => (
              <label
                key={tag.value}
                className="flex items-start gap-3 rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 transition hover:border-action/40 hover:bg-action/5"
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
          <FieldError state={state} field="risk_tags" />
        </fieldset>

        <label className="grid gap-2 text-sm font-semibold text-ink">
          証拠画像
          <input
            accept={getEvidenceAcceptAttribute()}
            className="rounded-md border border-line bg-white px-3 py-2 font-normal text-ink"
            multiple
            name="evidence_files"
            type="file"
          />
          <span className="text-xs font-normal leading-5 text-muted">
            最大{MAX_EVIDENCE_FILES}件、1ファイル{maxUploadMb}MBまで。一般公開されません。
          </span>
          <FieldError state={state} field="evidence_files" />
        </label>
      </section>

      <section className="grid gap-5">
        <TextInput
          label="連絡用メールアドレス"
          name={REPORT_CONTACT_EMAIL_FIELD}
          placeholder="公開されません"
          required
          state={state}
          type="email"
        />
        <button
          className="h-11 rounded-md bg-action px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-muted"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "送信中..." : "非公開で送信する"}
        </button>
      </section>
    </form>
  );
}
