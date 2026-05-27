import { INITIAL_AREAS, SITE } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

function absoluteUrl(path: string) {
  return `${SITE.url}${path}`;
}

export function getSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        inLanguage: "ja-JP",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
      },
    ],
  };
}

export function getHomeFaqStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "入店前チェック東京は口コミサイトですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "味や通常接客の評価ではなく、料金説明、会計確認、明細提示、退店時対応に関する注意報告を扱います。",
        },
      },
      {
        "@type": "Question",
        name: "投稿は自動公開されますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "投稿は自動公開されません。管理者が表現、個人情報、証拠レベルを確認してから公開判断します。",
        },
      },
      {
        "@type": "Question",
        name: "証拠画像や投稿者メールアドレスは公開されますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "証拠画像と投稿者メールアドレスは一般公開せず、管理者確認用の情報として扱います。",
        },
      },
    ],
  };
}

export function getPublicSourcesStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "情報ソース",
    url: absoluteUrl("/sources"),
    description:
      "入店前チェック東京で参照する公的・公式情報、報道、調査候補と、転載を避けた扱い方を整理しています。",
    isPartOf: {
      "@id": `${SITE.url}/#website`,
    },
  };
}

export function getBreadcrumbStructuredData(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getLlmsText() {
  const areaLines = INITIAL_AREAS.map(
    (area) => `- ${area.name}: ${absoluteUrl(`/areas/${area.slug}`)}`,
  );
  const topicLines = TOPIC_GUIDES.map(
    (topic) => `- ${topic.title}: ${absoluteUrl(`/topics/${topic.slug}`)}`,
  );

  return [
    `# ${SITE.name}`,
    "",
    SITE.description,
    "",
    "このサイトは飲食店の味や通常接客を評価する口コミサイトではありません。",
    "投稿者の申告に基づく注意情報を、管理者承認後に公開する方針です。",
    "証拠画像、投稿者メールアドレス、非公開メモは一般公開しません。",
    "",
    "## Key Pages",
    `- Home: ${absoluteUrl("/")}`,
    `- Map: ${absoluteUrl("/map")}`,
    `- Search: ${absoluteUrl("/search")}`,
    `- Sources: ${absoluteUrl("/sources")}`,
    `- Guidelines: ${absoluteUrl("/guidelines")}`,
    `- Support: ${absoluteUrl("/support")}`,
    `- Objection: ${absoluteUrl("/objection")}`,
    "",
    "## Areas",
    ...areaLines,
    "",
    "## Topics",
    ...topicLines,
    "",
    "## Display Policy",
    "- 星評価は使いません。",
    "- 味の評価は扱いません。",
    "- 投稿は自動公開しません。",
    "- 承認済み投稿だけを公開します。",
    "- 証拠画像や投稿者メールアドレスは一般公開しません。",
  ].join("\n");
}
