import { getAreaGrowthPlan } from "@/lib/area-growth";
import { INITIAL_AREAS } from "@/lib/site";

export type SearchGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  searchIntent: string;
  summary: string;
  beforeActions: readonly string[];
  evidenceToSave: readonly string[];
  consultationSteps: readonly string[];
  avoidActions: readonly string[];
  relatedTopicSlug: string;
  reportPrompt: string;
  snsHook: string;
};

export const SEARCH_GUIDES: SearchGuide[] = [
  {
    slug: "before-entry-price-check",
    title: "入店前の料金確認ガイド",
    shortTitle: "料金確認",
    description:
      "席料、サービス料、時間制、飲み放題条件、税の扱いを入店前に確認するための実用ガイドです。",
    searchIntent:
      "繁華街で案内を受けた後、入店前に総額や追加費目を確認したい",
    summary:
      "入店前の数分で、後から確認しにくい料金条件をそろえるためのページです。店舗や個人への断定ではなく、確認すべき項目を整理します。",
    beforeActions: [
      "席料、サービス料、チャージ、税、時間制を総額に近い形で確認する",
      "飲み放題やセット料金は、対象ドリンク、開始時刻、延長条件を分けて確認する",
      "客引き時の説明と店内説明が同じか、注文前にもう一度確認する",
      "不安がある場合は、入店しない判断も選択肢にする",
    ],
    evidenceToSave: [
      "料金表、メニュー、説明を受けた日時",
      "案内を受けた場所、入店先の住所、建物名、階数",
      "同行者と共有した料金条件のメモ",
    ],
    consultationSteps: [
      "説明と会計内容に差がある場合は、まず内訳の提示を依頼する",
      "身の危険を感じる場合は、安全確保を優先する",
      "後日確認できるよう、資料と時系列を保存する",
    ],
    avoidActions: [
      "店舗や個人を断定する表現をSNSへ投稿しない",
      "外部口コミやニュース本文をそのまま転載しない",
      "証拠画像に顔、電話番号、SNS IDが写ったまま公開しない",
    ],
    relatedTopicSlug: "price-confirmation",
    reportPrompt:
      "入店前説明、店内説明、会計時の説明差があれば、時系列で非公開投稿してください。",
    snsHook:
      "入店前に見る料金確認リスト。席料、サービス料、税、時間制を総額で確認してから判断。",
  },
  {
    slug: "receipt-itemized-bill-check",
    title: "明細・領収書の確認ガイド",
    shortTitle: "明細確認",
    description:
      "会計前後に明細、領収書、注文内容、人数、時間、追加費目を確認するためのガイドです。",
    searchIntent:
      "会計時に明細や領収書の提示がなく、後から何を保存すべきか知りたい",
    summary:
      "会計内容の確認は、感想ではなく資料と時系列が重要です。公開時は必要最小限の概要だけを扱い、証拠画像は一般公開しません。",
    beforeActions: [
      "注文内容、人数、時間、席料、サービス料、税の内訳を確認する",
      "明細または領収書の提示を落ち着いて依頼する",
      "カード決済の場合は利用控えと請求明細を後日照合する",
      "同行者がいる場合は、一人で会計対応しない",
    ],
    evidenceToSave: [
      "レシート、領収書、明細、カード利用控え",
      "注文した内容と人数、利用時間のメモ",
      "明細提示を依頼した時の説明内容",
    ],
    consultationSteps: [
      "会計後でも、保存した資料をもとにカード会社や消費生活相談を検討する",
      "説明内容は感情表現ではなく、日時と発言の要旨で記録する",
      "緊急性がある場合は警察への相談を優先する",
    ],
    avoidActions: [
      "レシート画像の氏名、カード番号、電話番号を公開しない",
      "店員個人名や顔写真を公開しない",
      "請求の正否を断定せず、確認中の情報として扱う",
    ],
    relatedTopicSlug: "itemized-bill",
    reportPrompt:
      "明細提示の有無、受け取った資料、会計時説明を分けて非公開投稿してください。",
    snsHook:
      "会計前後の確認リスト。明細、領収書、カード控えを保存し、後から説明内容を確認できる状態に。",
  },
  {
    slug: "card-payment-dispute",
    title: "カード決済後の確認ガイド",
    shortTitle: "カード確認",
    description:
      "カード決済額、利用控え、後日の請求明細、カード会社への相談準備を整理するガイドです。",
    searchIntent:
      "カード決済後に請求内容を確認し、どの資料をカード会社へ相談すべきか知りたい",
    summary:
      "カード決済の相談では、決済時の控え、請求明細、説明内容、時系列を分けて残すことが重要です。",
    beforeActions: [
      "決済端末の表示額を支払い前に確認する",
      "カード利用控えを受け取り、金額と日時を保存する",
      "後日の請求明細で金額、加盟店名、日付を照合する",
      "不明点はカード会社に相談し、必要資料を確認する",
    ],
    evidenceToSave: [
      "カード利用控え、請求明細、決済日時",
      "会計前に説明された金額と実際の決済額",
      "同行者情報、入店先の住所、建物名、階数",
    ],
    consultationSteps: [
      "カード会社に、利用日時、金額、加盟店表示、相談したい理由を伝える",
      "消費生活センターへ相談する場合も、同じ資料を整理する",
      "身の危険や脅しを感じた場合は、警察相談も検討する",
    ],
    avoidActions: [
      "カード番号、氏名、署名、承認番号を公開しない",
      "決済事業者や店舗の責任を断定しない",
      "スクリーンショットを無加工でSNSへ出さない",
    ],
    relatedTopicSlug: "checkout-response",
    reportPrompt:
      "決済時表示、利用控え、後日請求明細の差を、個人情報を除いて非公開投稿してください。",
    snsHook:
      "カード決済後の確認。利用控え、請求明細、説明内容を保存し、必要ならカード会社へ相談。",
  },
  {
    slug: "consumer-center-consultation",
    title: "消費生活相談へつなぐ準備ガイド",
    shortTitle: "相談準備",
    description:
      "消費者ホットライン188、警察相談専用電話#9110、カード会社相談へ進む前の資料整理ガイドです。",
    searchIntent:
      "料金説明や会計内容に不安があり、公的相談前に何を整理すべきか知りたい",
    summary:
      "相談の前に、日時、場所、金額、説明内容、資料を分けて整理すると、状況を伝えやすくなります。",
    beforeActions: [
      "緊急時は110番、緊急でない警察相談は#9110を確認する",
      "消費者ホットライン188を確認する",
      "カード決済の場合はカード会社の問い合わせ先も確認する",
      "安全が確保できる場所で、時系列を短くメモする",
    ],
    evidenceToSave: [
      "日時、住所、建物名、階数、入店経路",
      "説明された料金、実際の会計額、支払い方法",
      "レシート、明細、カード控え、メニュー、料金表",
    ],
    consultationSteps: [
      "相談先には、断定ではなく確認したい点として伝える",
      "同行者がいる場合は、覚えている説明内容を照合する",
      "投稿する場合も、個人情報と証拠画像は公開しない前提で送る",
    ],
    avoidActions: [
      "その場でSNS拡散を優先しない",
      "危険を感じる場面で支払い交渉を長引かせない",
      "個人名、顔写真、電話番号、SNS IDを投稿しない",
    ],
    relatedTopicSlug: "checkout-response",
    reportPrompt:
      "相談済みかどうか、相談先、保存資料の有無を分けて非公開投稿してください。",
    snsHook:
      "トラブル時は安全確保を優先。緊急時110番、相談は#9110、188、カード会社へ。",
  },
  {
    slug: "building-address-record",
    title: "住所・建物名・階数の記録ガイド",
    shortTitle: "場所記録",
    description:
      "店名変更や同一住所での類似報告を断定せず、場所情報を確認するためのガイドです。",
    searchIntent:
      "店名が分からない、または変わっている可能性があり、住所や建物で確認したい",
    summary:
      "店名だけでは確認が難しい場合があります。住所、建物名、階数、入口表示を分けて記録すると、審査時に確認しやすくなります。",
    beforeActions: [
      "入店前に住所、建物名、階数、入口表示を確認する",
      "Google Maps URLや周辺の目印を保存する",
      "店名が曖昧な場合は、看板の一部や通り名も記録する",
      "同一住所の類似報告は、同一運営や同一店舗と断定しない",
    ],
    evidenceToSave: [
      "住所、建物名、階数、Google Maps URL",
      "看板や入口表示の情報。ただし顔や電話番号は公開しない",
      "案内を受けた場所と実際に入店した場所の違い",
    ],
    consultationSteps: [
      "審査では、個別店舗の断定より場所確認と表現確認を優先する",
      "公開時は、必要な範囲に限定して住所または場所の手がかりを扱う",
      "証拠画像は管理者確認用として非公開のまま扱う",
    ],
    avoidActions: [
      "店名変更を理由に同一店舗と断定しない",
      "個人や従業員を特定できる情報を公開しない",
      "住所情報だけで危険性を断定しない",
    ],
    relatedTopicSlug: "solicitation",
    reportPrompt:
      "店名が曖昧でも、住所、建物名、階数、案内地点を分けて非公開投稿してください。",
    snsHook:
      "店名が分からなくても、住所、建物名、階数、入口表示を記録すると後から確認しやすい。",
  },
  {
    slug: "weekend-night-checklist",
    title: "週末・深夜の入店前チェック",
    shortTitle: "週末深夜",
    description:
      "週末や深夜帯に、料金条件、同行者共有、安全確保、相談導線を確認するためのガイドです。",
    searchIntent:
      "週末や深夜に繁華街へ行く前に、短時間で確認できるリストを見たい",
    summary:
      "週末や深夜は判断を急ぎやすいため、入店前の総額確認、同行者共有、退店時の安全確保を先に決めておくことが重要です。",
    beforeActions: [
      "入店前に総額、時間制、追加料金の有無を確認する",
      "同行者と店名、住所、建物名、支払い上限を共有する",
      "支払い前に明細とカード利用控えを確認する",
      "身の危険を感じた場合は支払い交渉より安全確保を優先する",
    ],
    evidenceToSave: [
      "入店前の説明、店内説明、会計時説明",
      "レシート、明細、カード利用控え",
      "同行者情報、日時、移動経路",
    ],
    consultationSteps: [
      "安全な場所に移動してから資料を整理する",
      "緊急時は110番、緊急でない相談は#9110や188を確認する",
      "投稿は非公開で送信し、管理者の表現確認を待つ",
    ],
    avoidActions: [
      "酔った状態で長文のSNS投稿をしない",
      "個人情報を含む画像を公開しない",
      "店舗や個人について断定的に書かない",
    ],
    relatedTopicSlug: "checkout-response",
    reportPrompt:
      "週末・深夜帯の経緯は、入店前説明、会計時対応、安全確保の順に非公開投稿してください。",
    snsHook:
      "週末・深夜の入店前確認。総額、時間制、明細、同行者共有、安全確保を先に決める。",
  },
] as const;

export function getSearchGuide(slug: string) {
  return SEARCH_GUIDES.find((guide) => guide.slug === slug) ?? null;
}

export function getAreaSearchGuide(areaSlug: string, guideSlug: string) {
  const area = INITIAL_AREAS.find((item) => item.slug === areaSlug);
  const guide = getSearchGuide(guideSlug);

  if (!area || !guide) {
    return null;
  }

  const growthPlan = getAreaGrowthPlan(areaSlug);

  return {
    area,
    guide,
    title: `${area.name}の${guide.shortTitle}ガイド`,
    description: `${area.name}周辺で${guide.description}`,
    localFocus:
      growthPlan?.contributionAsk ??
      "場所、料金説明、明細提示、会計時対応を分けて記録してください。",
    zeroStateValue:
      growthPlan?.publicZeroStateValue ??
      "公開投稿が少ない段階でも、入店前の確認項目と相談導線を表示します。",
  };
}
