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
    goal: "非公開デフォルトと管理者審査を伝えて投稿ハードルを下げる",
    examples: [
      "投稿は自動公開されず、証拠画像とメールアドレスは一般公開しない",
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
  "朝: 保存されやすい入店前チェックを1投稿",
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
  return `${title}｜${SITE.name}\n投稿者の申告に基づく注意情報です。入店前の料金確認を推奨します。`;
}

export function buildSocialPostTemplates(): SocialPostTemplate[] {
  const coreTemplates: SocialPostTemplate[] = [
    {
      title: "固定ポスト候補",
      targetUrl: getAbsoluteSiteUrl("/"),
      text: [
        `${SITE.name}を公開しました。`,
        "",
        "キャッチについて行く前に見る、都内繁華街の注意マップです。",
        "味や通常接客の評価ではなく、料金説明、会計確認、明細提示、退店時対応に関する注意報告を扱います。",
        "投稿は自動公開せず、証拠画像と投稿者メールアドレスは一般公開しません。",
      ].join("\n"),
    },
    {
      title: "サービス紹介",
      targetUrl: getAbsoluteSiteUrl("/"),
      text: [
        `${SITE.name}`,
        SITE.description,
        "星評価や味の評価ではなく、料金説明、会計確認、明細提示、退店時対応に関する注意報告を扱います。",
        "投稿は自動公開せず、証拠画像と投稿者メールアドレスは一般公開しません。",
      ].join("\n"),
    },
    {
      title: "情報提供募集",
      targetUrl: getAbsoluteSiteUrl("/contribute"),
      text: [
        "都内繁華街での入店前確認に役立つ情報提供を受け付けています。",
        "料金説明と会計内容の不一致、明細提示、会計時対応など、具体的な経緯を非公開で送信できます。",
        "投稿者の申告に基づく情報として、公開前に管理者が確認します。",
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
        "店舗名や住所の手がかりで、承認済みの注意報告がある場所を検索できます。",
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
    targetUrl: getAbsoluteSiteUrl(`/areas/${area.slug}`),
    text: [
      `${area.name}周辺の入店前確認に役立つ注意情報を整理しています。`,
      "料金説明、会計確認、明細提示、退店時対応に関する具体的な報告を募集しています。",
      "投稿は自動公開されず、投稿者メールアドレスや証拠画像は一般公開しません。",
    ].join("\n"),
  }));

  const topicTemplates = TOPIC_GUIDES.map((topic) => ({
    title: `${topic.title}の確認`,
    targetUrl: getAbsoluteSiteUrl(`/topics/${topic.slug}`),
    text: [
      `${topic.title}に関する確認項目を整理しました。`,
      "入店前、会計前、退店後に記録しておきたい情報を確認できます。",
      "掲載内容は投稿者の申告に基づく注意情報として扱います。",
    ].join("\n"),
  }));

  return [...coreTemplates, ...areaTemplates, ...topicTemplates];
}
