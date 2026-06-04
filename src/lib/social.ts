import { INITIAL_AREAS, SITE } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

export type SocialProfileLink = {
  label: string;
  href: string;
};

export type SocialPostTemplate = {
  title: string;
  targetUrl: string;
  text: string;
};

export type SocialOperationPillar = {
  title: string;
  goal: string;
  examples: string[];
};

export const SOCIAL_OPERATION_PILLARS: SocialOperationPillar[] = [
  {
    title: "入店前チェック",
    goal: "保存されやすい確認項目で検索外の流入を増やす",
    examples: [
      "料金、席料、サービス料、飲み放題条件を入店前に確認する",
      "会計前に明細、注文内容、説明内容の違いを確認する",
    ],
  },
  {
    title: "相談導線",
    goal: "困った人がすぐ動ける導線として信頼を作る",
    examples: [
      "緊急時は110番、相談は#9110や188も検討する",
      "レシート、明細、メニュー、日時、同行者情報を保存する",
    ],
  },
  {
    title: "情報提供募集",
    goal: "具体的な経緯を送りやすくして情報提供を増やす",
    examples: [
      "連絡先や添付資料は公開ページに出さずに受け付ける",
      "料金説明、会計確認、明細提示、退店時対応の具体的な経緯を募集する",
    ],
  },
  {
    title: "公的・公式情報",
    goal: "転載せず、公式確認先へのリンクで公共性を補強する",
    examples: [
      "自治体、警察、消費生活相談の公式情報を紹介する",
      "本文や画像は転載せず、確認日と独自要約で扱う",
    ],
  },
];

export const SOCIAL_WEEKLY_ROUTINE = [
  "朝: 30秒で送れる情報提供募集を1投稿",
  "昼: エリア別ページまたは相談導線を1投稿",
  "夜: 情報提供募集または固定ポストへの返信を1投稿",
  "毎日: 返信は断定せず、個別店舗名が出たら公開フォームへ誘導",
  "毎週: 反応が高い投稿を1つ固定ポスト候補として見直す",
] as const;

const socialProfileEnv = [
  ["X", "NEXT_PUBLIC_X_PROFILE_URL"],
  ["Instagram", "NEXT_PUBLIC_INSTAGRAM_PROFILE_URL"],
  ["TikTok", "NEXT_PUBLIC_TIKTOK_PROFILE_URL"],
  ["LINE", "NEXT_PUBLIC_LINE_PROFILE_URL"],
] as const;

export function getAbsoluteSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${normalizedPath}`;
}

export function getSocialProfileLinks(): SocialProfileLink[] {
  return socialProfileEnv
    .map(([label, envName]) => ({
      label,
      href: process.env[envName] ?? "",
    }))
    .filter((link) => link.href.startsWith("https://"));
}

export function buildShareText(title: string) {
  return `${title}｜${SITE.name}\n都内繁華街で入店前に確認したい料金・明細・相談先をまとめています。必要な人に共有できます。`;
}

export function buildSocialPostTemplates(): SocialPostTemplate[] {
  const coreTemplates: SocialPostTemplate[] = [
    {
      title: "固定ポスト候補",
      targetUrl: getAbsoluteSiteUrl("/reports/quick"),
      text: [
        `${SITE.name}を公開しました。`,
        "",
        "情報提供で育てる、都内繁華街の入店前チェックです。",
        "店名が曖昧でも、住所、建物名、階数、料金説明、明細の有無を非公開で送れます。",
        "投稿は自動公開されず、証拠画像や連絡先は公開ページに出しません。",
      ].join("\n"),
    },
    {
      title: "サービス紹介",
      targetUrl: getAbsoluteSiteUrl("/"),
      text: [
        `${SITE.name}`,
        SITE.description,
        "料金説明、会計確認、明細提示、退店時対応に関する情報を整理しています。",
        "エリア別の確認リストと相談先もまとめています。",
      ].join("\n"),
    },
    {
      title: "情報提供募集",
      targetUrl: getAbsoluteSiteUrl("/reports/quick"),
      text: [
        "都内繁華街での入店前確認に役立つ情報提供を受け付けています。",
        "住所、建物名、階数、料金説明、明細提示、会計時対応など、具体的な経緯を非公開で送信できます。",
        "連絡先や添付資料は公開ページに出しません。",
      ].join("\n"),
    },
    {
      title: "保存向けチェック",
      targetUrl: getAbsoluteSiteUrl("/checklists"),
      text: [
        "入店前に確認したいこと。",
        "",
        "1. 料金表と税込/税別",
        "2. 席料、サービス料、チャージ",
        "3. 飲み放題の条件",
        "4. 会計前の明細提示",
        "5. 退店時に困った時の相談先",
        "",
        "不安がある時は、入店前の料金確認を推奨します。",
      ].join("\n"),
    },
    {
      title: "公式確認先紹介",
      targetUrl: getAbsoluteSiteUrl("/sources"),
      text: [
        "都内繁華街での入店前確認に役立つ公式情報を整理しています。",
        "",
        "自治体、警察、消費生活相談などの公式リンクを確認日付きで掲載。",
        "外部本文や画像は転載せず、独自要約と出典URLとして扱います。",
      ].join("\n"),
    },
    {
      title: "検索導線",
      targetUrl: getAbsoluteSiteUrl("/search"),
      text: [
        "店舗名や住所の手がかりで、公開情報を検索できます。",
        "",
        "まだ公開情報が少ない場合も、関連エリアや公式確認先から入店前確認を始められます。",
      ].join("\n"),
    },
    {
      title: "相談導線",
      targetUrl: getAbsoluteSiteUrl("/support"),
      text: [
        "会計内容に不安がある場合は、レシート、明細、メニュー、説明内容、日時を保存してください。",
        "身の危険を感じた場合は安全確保を優先し、緊急時は110番、相談は#9110や188も検討できます。",
      ].join("\n"),
    },
  ];

  const areaTemplates = INITIAL_AREAS.map((area) => ({
    title: `${area.name}の情報提供募集`,
    targetUrl: getAbsoluteSiteUrl(`/reports/quick?area=${area.slug}`),
    text: [
      `${area.name}周辺の入店前確認に役立つ情報を整理しています。`,
      "料金説明、会計確認、明細提示、退店時対応に関する具体的な報告を募集しています。",
      "住所、建物名、階数などの手がかりも送信できます。",
    ].join("\n"),
  }));

  const topicTemplates = TOPIC_GUIDES.map((topic) => ({
    title: `${topic.title}の確認`,
    targetUrl: getAbsoluteSiteUrl(`/topics/${topic.slug}`),
    text: [
      `${topic.title}に関する確認項目を整理しました。`,
      "入店前、会計前、退店後に記録しておきたい情報を確認できます。",
      "エリア別ページや相談先にも移動できます。",
    ].join("\n"),
  }));

  return [...coreTemplates, ...areaTemplates, ...topicTemplates];
}
