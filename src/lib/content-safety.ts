export const DANGEROUS_EXPRESSION_NOTICE =
  "断定、侮辱、個人攻撃、犯罪や属性の決めつけと受け取られる可能性がある表現が含まれています。事実経過、金額、説明内容、確認状況に置き換えてください。";

export const SAFE_EXPRESSION_EXAMPLES = [
  "高額請求トラブル報告あり",
  "料金説明と会計内容の不一致報告あり",
  "会計時対応に関する注意報告あり",
  "投稿者の申告に基づく情報です",
] as const;

const DANGEROUS_EXPRESSIONS = [
  "ぼったくり店",
  "悪質店",
  "詐欺店",
  "犯罪店",
  "反社",
  "絶対行くな",
  "サクラ確定",
  "クズ",
  "晒し",
] as const;

export const REPORT_TEXT_FIELD_LABELS = {
  solicitation_description: "客引き時の説明",
  explanation_inside_store: "店内での説明",
  ordered_items: "注文内容",
  checkout_response: "会計時対応",
  exit_response: "退店時対応",
  public_summary: "公開用の報告概要",
  supplemental_note: "管理者向け補足",
} as const;

export const OBJECTION_TEXT_FIELD_LABELS = {
  target_url: "対象URLまたは投稿ID",
  requester_name: "申立て者名",
  requester_relationship: "関係性",
  details: "申立て内容",
  supplemental_note: "補足",
} as const;

type FieldLabelMap = Record<string, string>;

export function containsDangerousExpression(value: string) {
  const normalized = value.replace(/\s+/g, "");
  return DANGEROUS_EXPRESSIONS.some((expression) => normalized.includes(expression));
}

export function getDangerousFieldLabels(
  formData: FormData,
  fieldLabels: FieldLabelMap,
) {
  return Object.entries(fieldLabels)
    .filter(([field]) => {
      const value = formData.get(field);
      return typeof value === "string" && containsDangerousExpression(value);
    })
    .map(([, label]) => label);
}
