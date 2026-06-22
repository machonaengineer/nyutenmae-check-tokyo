import { RISK_TAGS } from "@/lib/site";

export type TopicGuide = {
  slug: string;
  title: string;
  description: string;
  riskTagSlugs: readonly string[];
  checks: readonly string[];
  howToUse: readonly string[];
  saveItems: readonly string[];
  publicDisplayNotes: readonly string[];
};

export const TOPIC_GUIDES: TopicGuide[] = [
  {
    slug: "price-confirmation",
    title: "料金説明の確認",
    description:
      "入店前と注文前に、席料、サービス料、時間制、飲み放題条件、税の扱いを確認するためのガイドです。",
    riskTagSlugs: [
      "price-billing-mismatch",
      "all-you-can-drink-condition-mismatch",
      "seat-service-fee-insufficient-explanation",
      "high-billing-trouble",
    ],
    checks: [
      "入店前に総額の目安を確認する",
      "席料、サービス料、チャージ、税が別か込みか確認する",
      "飲み放題や時間制の開始時刻、延長条件を確認する",
      "説明が変わった場合は注文前に再確認する",
    ],
    howToUse: [
      "入店前、注文前、会計前の3つに分けて確認する",
      "総額に近い説明を受けられるかを優先して確認する",
      "同行者がいる場合は、聞いた条件をその場で共有する",
    ],
    saveItems: [
      "料金表、メニュー、説明を受けた日時",
      "説明された金額と実際の会計額",
      "住所、建物名、階数、入店経路",
    ],
    publicDisplayNotes: [
      "公開時は断定ではなく、料金説明と会計内容の不一致報告として扱う",
      "証拠画像や連絡先は一般公開しない",
      "未確認の推測や感情的な表現は掲載対象にしない",
    ],
  },
  {
    slug: "itemized-bill",
    title: "明細提示の確認",
    description:
      "会計前後に明細、領収書、注文内容、人数、時間を確認し、資料を保存するためのガイドです。",
    riskTagSlugs: ["itemized-bill-trouble"],
    checks: [
      "注文内容、人数、時間、席料、サービス料の内訳を確認する",
      "明細や領収書の提示を依頼する",
      "受け取った資料は撮影や保管を検討する",
      "カード利用控えと後日の請求明細を照合する",
    ],
    howToUse: [
      "会計前に内訳を確認し、会計後に受け取った資料を保存する",
      "明細がない場合も、注文内容、人数、利用時間をメモする",
      "カード決済では利用控えと後日の請求明細を照合する",
    ],
    saveItems: [
      "明細、領収書、カード利用控え",
      "注文内容、人数、利用時間",
      "明細提示を依頼した時の説明内容",
    ],
    publicDisplayNotes: [
      "レシートや明細の画像URLは公開しない",
      "氏名、カード情報、電話番号が写る資料は非公開で扱う",
      "公開サマリーでは明細提示に関するトラブル報告として表現する",
    ],
  },
  {
    slug: "solicitation",
    title: "客引き経由の来店前確認",
    description:
      "客引き時の説明と店内説明の違いを避けるため、入店前に条件を整理するガイドです。",
    riskTagSlugs: ["solicited-entry"],
    checks: [
      "客引き時の説明内容を同行者と共有する",
      "店内で同じ条件が適用されるか確認する",
      "場所、建物名、階数、店名を確認する",
      "不安が残る場合は入店しない判断も選択肢にする",
    ],
    howToUse: [
      "移動前に店名、住所、料金条件を確認する",
      "案内時の説明と店内説明が同じか注文前に再確認する",
      "条件が曖昧な場合は入店を急がない",
    ],
    saveItems: [
      "案内を受けた場所、時刻、説明内容",
      "入店先の住所、建物名、階数",
      "同行者と共有した料金条件",
    ],
    publicDisplayNotes: [
      "公開時は客引き経由の来店報告として扱う",
      "案内者個人を特定する情報は公開しない",
      "店名が曖昧な場合は住所や建物情報を優先して確認する",
    ],
  },
  {
    slug: "checkout-response",
    title: "会計時・退店時対応の確認",
    description:
      "会計時や退店時に不安を感じた場合に、安全確保と記録保存を優先するためのガイドです。",
    riskTagSlugs: [
      "checkout-response-attention",
      "exit-response-attention",
      "itemized-bill-trouble",
    ],
    checks: [
      "身の危険を感じる場合は支払い交渉より安全確保を優先する",
      "同行者と合流し、人通りのある場所へ移動する",
      "緊急時は110番、緊急でない相談は#9110や188を確認する",
      "日時、金額、説明内容、対応内容を後からメモする",
    ],
    howToUse: [
      "安全確保、明細確認、相談準備を分けて考える",
      "身の危険を感じる場合は交渉より安全確保を優先する",
      "退店後に落ち着いて時系列を整理する",
    ],
    saveItems: [
      "請求額、支払い方法、支払い時刻",
      "会計時や退店時に受けた説明の要旨",
      "相談先、相談日時、回答内容",
    ],
    publicDisplayNotes: [
      "公開時は会計時対応または退店時対応に関する注意報告として扱う",
      "緊急性や法的判断はサイト上で断定しない",
      "個人名、顔写真、電話番号は公開しない",
    ],
  },
  {
    slug: "seat-service-fee",
    title: "席料・サービス料の確認",
    description:
      "席料、サービス料、チャージ、税、カード利用時の扱いを、入店前に分けて確認するためのガイドです。",
    riskTagSlugs: ["seat-service-fee-insufficient-explanation"],
    checks: [
      "席料、サービス料、チャージの有無を確認する",
      "税込か税別か、カード利用時に扱いが変わるか確認する",
      "一人あたりとテーブル単位の費用を分けて確認する",
      "会計時に説明と差がある場合は内訳を確認する",
    ],
    howToUse: [
      "基本料金だけでなく追加費目を一覧で確認する",
      "口頭説明だけでなく店内表示やメニューも確認する",
      "同行者と一人あたりの上限額を共有する",
    ],
    saveItems: [
      "料金表、メニュー、店内表示",
      "説明された追加費目と会計時の内訳",
      "利用人数、利用時間、支払い方法",
    ],
    publicDisplayNotes: [
      "公開時は席料・サービス料の説明不足報告として扱う",
      "料金体系の正否をサイト上で断定しない",
      "資料画像は非公開の管理者確認用として扱う",
    ],
  },
  {
    slug: "all-you-can-drink-conditions",
    title: "飲み放題条件の確認",
    description:
      "飲み放題やセット料金の対象、開始時刻、終了時刻、延長条件、対象外注文を確認するためのガイドです。",
    riskTagSlugs: ["all-you-can-drink-condition-mismatch"],
    checks: [
      "対象ドリンク、対象外メニュー、注文条件を確認する",
      "開始時刻、終了時刻、ラストオーダーを確認する",
      "延長料金と自動延長の有無を確認する",
      "説明が変わった場合は注文前に再確認する",
    ],
    howToUse: [
      "飲み放題の対象と対象外を分けて確認する",
      "時間制の基準時刻を同行者と共有する",
      "会計前に対象外注文や延長の有無を確認する",
    ],
    saveItems: [
      "飲み放題条件の説明内容",
      "注文した内容、人数、利用時間",
      "会計時に対象外と説明された項目",
    ],
    publicDisplayNotes: [
      "公開時は飲み放題条件の不一致報告として扱う",
      "注文内容の詳細は必要最小限に整理する",
      "未確認の推測は公開サマリーに含めない",
    ],
  },
  {
    slug: "card-company-consultation",
    title: "カード会社へ相談する前の整理",
    description:
      "カード決済後に請求内容を確認したい場合の、利用控え、請求明細、説明内容の整理方法です。",
    riskTagSlugs: ["checkout-response-attention", "high-billing-trouble"],
    checks: [
      "利用控え、請求明細、決済日時を確認する",
      "加盟店表示、金額、支払い方法を控える",
      "会計前に説明された金額との差を整理する",
      "カード会社に相談した日時と回答内容を記録する",
    ],
    howToUse: [
      "カード会社へ伝える情報を一枚のメモにまとめる",
      "相談前に個人情報を公開しない保管方法を確認する",
      "消費生活相談と併用する場合も同じ資料を使う",
    ],
    saveItems: [
      "カード利用控え、請求明細、支払い日時",
      "説明された金額と実際の決済額",
      "カード会社への相談履歴",
    ],
    publicDisplayNotes: [
      "カード番号、氏名、承認番号は公開しない",
      "カード会社や店舗の判断を断定しない",
      "公開時はカード決済後の確認報告として整理する",
    ],
  },
  {
    slug: "evidence-privacy",
    title: "証拠画像と個人情報の扱い",
    description:
      "レシート、明細、メニュー、スクリーンショットを保存する時に、公開してはいけない情報を確認するガイドです。",
    riskTagSlugs: ["itemized-bill-trouble"],
    checks: [
      "氏名、カード番号、電話番号、顔が写る資料を公開しない",
      "証拠画像は管理者確認用として非公開で送る",
      "SNS IDや個人を特定できる情報を含めない",
      "公開サマリーには必要最小限の事実経過だけを書く",
    ],
    howToUse: [
      "原本は手元に保存し、公開用と非公開確認用を分ける",
      "投稿前に個人情報が写っていないか確認する",
      "不安がある画像は公開せず、相談先へ確認する",
    ],
    saveItems: [
      "原本画像、レシート、明細、カード控え",
      "撮影日時、入店日時、相談日時",
      "公開してよい要約と非公開で見てほしい内容",
    ],
    publicDisplayNotes: [
      "証拠画像URLは公開ページに表示しない",
      "投稿者メールアドレスは一般公開しない",
      "公開情報と管理者確認情報を分けて扱う",
    ],
  },
  {
    slug: "same-building-signals",
    title: "同一住所・同一建物の確認",
    description:
      "店名が変わる場合や同じ建物内の報告を、断定せずに住所、建物名、階数で整理するためのガイドです。",
    riskTagSlugs: ["similar-reports-same-address"],
    checks: [
      "住所、建物名、階数を分けて確認する",
      "店名が曖昧な場合は入口表示やGoogle Maps URLを保存する",
      "同一住所でも同一運営や同一店舗とは断定しない",
      "公開時は類似報告の有無と確認中であることを分ける",
    ],
    howToUse: [
      "店名よりもまず場所情報を正確に残す",
      "看板や入口表示は個人情報が写らない範囲で保存する",
      "公開判断では住所、建物、階数、報告時期を照合する",
    ],
    saveItems: [
      "住所、建物名、階数、Google Maps URL",
      "入店経路、案内された場所、入口表示",
      "店名表記、看板表記、訪問日",
    ],
    publicDisplayNotes: [
      "同一住所で類似報告ありという表現に留める",
      "運営主体や責任関係をサイト上で断定しない",
      "公開前に管理者が表現と根拠を確認する",
    ],
  },
  {
    slug: "objection-and-correction",
    title: "異議申立てと訂正対応",
    description:
      "店舗関係者や当事者からの異議申立て、訂正依頼、非公開化依頼を安全に扱うための案内です。",
    riskTagSlugs: ["objection-filed", "under-review"],
    checks: [
      "対象URL、対象内容、連絡先、申立て理由を分けて送る",
      "事実確認が必要な場合は一時非公開や表現修正を検討する",
      "証拠画像や連絡先は一般公開しない",
      "管理者操作ログを残して対応経緯を確認できるようにする",
    ],
    howToUse: [
      "公開ページの異議申立てリンクから非公開で送る",
      "削除、訂正、反論掲載、追加確認の希望を分けて書く",
      "個人情報や証拠資料は公開欄に書かない",
    ],
    saveItems: [
      "対象URL、対象表示、申立て内容",
      "連絡用メールアドレス、所属、確認できる資料",
      "対応日時、管理者判断、非公開化の有無",
    ],
    publicDisplayNotes: [
      "店舗側より異議申立てありというタグで扱う場合がある",
      "申立て内容そのものは一般公開しない",
      "確認中の情報は必要に応じて表示または非公開化する",
    ],
  },
  {
    slug: "safe-information-sharing",
    title: "安全な情報提供の書き方",
    description:
      "情報提供時に、事実経過、金額、説明内容、相談状況を分け、断定や個人情報を避けるためのガイドです。",
    riskTagSlugs: ["under-review"],
    checks: [
      "日時、場所、人数、金額、説明内容を分けて書く",
      "感想や断定ではなく、確認した事実経過を書く",
      "個人名、顔写真、電話番号、SNS IDを書かない",
      "外部口コミやニュース本文を転載しない",
    ],
    howToUse: [
      "公開してよい要約と管理者だけに見てほしい内容を分ける",
      "証拠画像は非公開添付として扱う",
      "不安がある場合は相談先も同時に確認する",
    ],
    saveItems: [
      "入店前説明、店内説明、会計時説明",
      "請求額、支払い方法、明細の有無",
      "相談済みの窓口と相談日時",
    ],
    publicDisplayNotes: [
      "投稿はpendingとHiddenを基本に管理者審査へ回す",
      "承認済み情報だけを公開する",
      "公開時は投稿者の申告に基づく情報として表示する",
    ],
  },
] as const;

export function getTopicGuide(slug: string) {
  return TOPIC_GUIDES.find((topic) => topic.slug === slug) ?? null;
}

export function getTopicRiskTagLabels(slug: string) {
  const topic = getTopicGuide(slug);

  if (!topic) {
    return [] as string[];
  }

  const labels: string[] = [];

  for (const riskTagSlug of topic.riskTagSlugs) {
    const label = RISK_TAGS.find((tag) => tag.slug === riskTagSlug)?.label;

    if (label) {
      labels.push(label);
    }
  }

  return labels;
}
