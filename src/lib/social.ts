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
