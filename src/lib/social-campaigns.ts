import { SEARCH_GUIDES } from "@/lib/search-guides";
import { INITIAL_AREAS } from "@/lib/site";

export type SocialRecognitionPost = {
  day: number;
  slot: "morning" | "evening" | "weekend";
  pillar: "area" | "guide" | "support" | "contribution";
  title: string;
  body: string;
  targetPath: string;
};

const guidePosts: SocialRecognitionPost[] = SEARCH_GUIDES.map((guide, index) => ({
  day: index + 1,
  slot: index % 2 === 0 ? "evening" : "morning",
  pillar: "guide",
  title: `${guide.shortTitle}の確認`,
  body: `${guide.snsHook} 投稿者の申告に基づく注意情報として、証拠と公開本文を分けて扱います。`,
  targetPath: `/guides/${guide.slug}`,
}));

const areaPosts: SocialRecognitionPost[] = INITIAL_AREAS.map((area, index) => ({
  day: index + 7,
  slot: "evening",
  pillar: "area",
  title: `${area.name}の入店前確認`,
  body: `${area.name}周辺で入店前に確認したい項目を整理しています。料金説明、明細、建物名、階数を保存してから判断を。`,
  targetPath: `/areas/${area.slug}`,
}));

const supportPosts: SocialRecognitionPost[] = [
  {
    day: 19,
    slot: "weekend",
    pillar: "support",
    title: "週末前の相談先確認",
    body:
      "身の危険を感じた場合は安全確保を優先。緊急時は110番、相談は#9110、188、カード会社への連絡も確認を。",
    targetPath: "/support",
  },
  {
    day: 20,
    slot: "morning",
    pillar: "contribution",
    title: "30秒の情報提供",
    body:
      "店名が曖昧でも、住所、建物名、階数、会計前説明の手がかりが役立ちます。送信内容は自動公開されません。",
    targetPath: "/reports/quick",
  },
  {
    day: 21,
    slot: "evening",
    pillar: "contribution",
    title: "証拠画像は非公開",
    body:
      "レシートや明細は公開せず、管理者確認用として扱います。公開ページには投稿者メールや証拠画像URLを出しません。",
    targetPath: "/trust",
  },
  {
    day: 22,
    slot: "weekend",
    pillar: "guide",
    title: "週末深夜の確認",
    body:
      "週末・深夜は、総額、時間制、明細、同行者共有、安全確保を先に決めておくと後から確認しやすくなります。",
    targetPath: "/guides/weekend-night-checklist",
  },
  {
    day: 23,
    slot: "morning",
    pillar: "support",
    title: "公開しない情報",
    body:
      "入店前チェック東京は、証拠画像、投稿者メール、非公開メモを一般公開しません。承認済み投稿だけを慎重に表示します。",
    targetPath: "/trust",
  },
  {
    day: 24,
    slot: "evening",
    pillar: "contribution",
    title: "場所の手がかり募集",
    body:
      "建物名、階数、入店前説明、会計時説明を分けて記録すると、審査時に確認しやすくなります。",
    targetPath: "/contribute",
  },
  {
    day: 25,
    slot: "morning",
    pillar: "guide",
    title: "カード控えの保存",
    body:
      "カード決済後は、利用控えと後日の請求明細を照合。カード番号など個人情報は公開しないでください。",
    targetPath: "/guides/card-payment-dispute",
  },
  {
    day: 26,
    slot: "evening",
    pillar: "area",
    title: "地図で確認",
    body:
      "地図に表示するのは承認済み投稿がある場所だけです。未承認投稿や証拠画像は一般公開しません。",
    targetPath: "/map",
  },
  {
    day: 27,
    slot: "weekend",
    pillar: "guide",
    title: "明細提示の確認",
    body:
      "会計前後は、注文内容、人数、時間、席料、サービス料の内訳を確認。受け取った資料は保存を。",
    targetPath: "/guides/receipt-itemized-bill-check",
  },
  {
    day: 28,
    slot: "morning",
    pillar: "support",
    title: "相談前の整理",
    body:
      "相談前は、日時、場所、金額、説明内容、資料を分けて整理。断定ではなく確認したい点として伝えるのが安全です。",
    targetPath: "/guides/consumer-center-consultation",
  },
  {
    day: 29,
    slot: "evening",
    pillar: "contribution",
    title: "情報提供の粒度",
    body:
      "入店前説明、店内説明、会計時説明、明細提示の有無を分けて送ると、公開前審査で扱いやすくなります。",
    targetPath: "/reports/quick",
  },
  {
    day: 30,
    slot: "weekend",
    pillar: "area",
    title: "対象エリア拡大中",
    body:
      "新宿、池袋、渋谷、上野周辺から、六本木、銀座、新橋、赤坂、錦糸町、五反田、立川、町田、吉祥寺へ拡大中。",
    targetPath: "/areas",
  },
];

export const SOCIAL_RECOGNITION_POSTS: SocialRecognitionPost[] = [
  ...guidePosts,
  ...areaPosts,
  ...supportPosts,
].sort((left, right) => left.day - right.day);

export function getSocialRecognitionPosts() {
  return SOCIAL_RECOGNITION_POSTS;
}
