import { INITIAL_AREAS } from "@/lib/site";

export const ENTRY_CHECK_ITEMS = [
  "入店前に、席料、サービス料、チャージ、税、時間制、飲み放題条件を確認する",
  "客引き時の説明と店内説明が違う場合は、その場で条件を確認する",
  "メニュー、料金表、説明内容を同行者と共有し、支払い前に金額感を合わせる",
  "不安がある場合は、入店しない判断も選択肢にする",
] as const;

export const CHECKOUT_CHECK_ITEMS = [
  "会計前に、注文内容、人数、時間、席料、サービス料、税の内訳を確認する",
  "明細や領収書の提示を依頼し、受け取った資料を保存する",
  "カード決済の場合は、利用控えと後日の請求明細を照合する",
  "身の危険を感じる場合は、支払い交渉より安全確保を優先する",
] as const;

export const RECORD_KEEP_ITEMS = [
  "来店日時、人数、同行者情報、支払い方法、請求金額",
  "入店前の説明、店内での説明、会計時の説明の違い",
  "メニュー、料金表、レシート、明細、カード利用控え",
  "住所、建物名、階数、Google Maps URLなど場所を特定できる情報",
] as const;

export const MONETIZATION_GUARDRAILS = [
  "広告やスポンサー表示は、法務文面と表示位置を確認してから有効化する",
  "掲載順位、リスクタグ、証拠レベルは広告主や支援者の影響を受けない",
  "収益化を開始する場合は、ホスティング規約、広告ポリシー、Cookie表示を確認する",
  "外部口コミ本文、画像、スクリーンショットは収益化ページにも転載しない",
] as const;

const areaTips: Record<string, readonly string[]> = {
  "shinjuku-kabukicho": [
    "複数人で移動し、入店前に総額の目安を確認する",
    "客引き時の説明と店内説明に差がある場合は、注文前に条件を確認する",
    "会計時に明細提示がない場合は、内訳を落ち着いて確認する",
  ],
  ikebukuro: [
    "駅周辺から離れる前に、店名、住所、建物名を確認する",
    "時間制や飲み放題条件は、入店前と注文前の両方で確認する",
    "カード決済時は利用控えを保存し、後日の請求明細と照合する",
  ],
  "shibuya-dogenzaka-udagawacho": [
    "入店前に、席料、サービス料、深夜料金の有無を確認する",
    "複数店舗を比較し、条件が曖昧な場合は入店を急がない",
    "同行者と説明内容を共有し、会計時に一人で対応しない",
  ],
  "ueno-okachimachi-yushima": [
    "建物名、階数、入口の表示を確認してから入店する",
    "退店時対応に不安がある場合は、人通りのある場所への移動を優先する",
    "領収書、明細、メニューなど後から確認できる資料を保存する",
  ],
};

export function getAreaChecklist(slug: string) {
  const area = INITIAL_AREAS.find((item) => item.slug === slug);

  if (!area) {
    return null;
  }

  return {
    ...area,
    tips: areaTips[slug] ?? ENTRY_CHECK_ITEMS,
  };
}
