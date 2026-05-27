import { SITE } from "@/lib/site";

export type ResearchSource = {
  id: string;
  areaSlug: string;
  areaName: string;
  sourceType: "public_agency" | "police" | "consumer_center" | "municipality";
  sourceTitle: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  priority: "high" | "medium" | "low";
  publicSummary: string;
  suggestedUse: string;
  nextAction: string;
};

export const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: "shinjuku-consumer-high-billing-consultation",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "municipality",
    sourceTitle: "新宿区の高額請求トラブル相談案内",
    sourceUrl: "https://www.city.shinjuku.lg.jp/seikatsu/shohi01_000300.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "新宿区が、飲食店利用後の高額請求に関する相談先を案内している公式ページです。",
    suggestedUse:
      "新宿・歌舞伎町の相談導線、初期データ調査、公開サマリーの表現確認に使います。",
    nextAction:
      "相談案内の内容を要約し、店舗名や個人情報を含めずにエリア別注意ページへ反映する。",
  },
  {
    id: "metropolitan-police-shinjuku-safe-drinking",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "police",
    sourceTitle: "警視庁の新宿繁華街利用時の注意喚起",
    sourceUrl:
      "https://www.keishicho.metro.tokyo.lg.jp/about_mpd/shokai/ichiran/kankatsu/shinjuku/about_ps/safe_drinking.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "警視庁が、新宿周辺で飲食店を利用する際の注意点を案内しているページです。",
    suggestedUse:
      "入店前確認、客引き経由の来店、相談導線に関する一般的な注意喚起として参照します。",
    nextAction:
      "注意喚起の趣旨だけを独自要約し、個別店舗への断定に使わないことを確認する。",
  },
  {
    id: "tokyo-consumer-consultation",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "consumer_center",
    sourceTitle: "東京都消費生活総合センターの相談案内",
    sourceUrl: "https://www.shouhiseikatu.metro.tokyo.lg.jp/sodan/sodan.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "東京都の消費生活相談窓口案内です。会計内容に不安がある場合の相談導線として扱います。",
    suggestedUse:
      "全エリア共通の相談導線、投稿後の案内、サポートページの確認に使います。",
    nextAction:
      "電話番号、受付条件、公式URLの確認日を運用メモに残し、相談導線ページを定期点検する。",
  },
  {
    id: "toshima-safety-security-efforts",
    areaSlug: "ikebukuro",
    areaName: "池袋",
    sourceType: "municipality",
    sourceTitle: "豊島区の安全・安心に関する取組",
    sourceUrl: "https://www.city.toshima.lg.jp/048/chian/1812031128.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "豊島区が、安全・安心に関する区の取組を案内している公式ページです。",
    suggestedUse:
      "池袋エリアの背景情報、公式相談先、調査対象エリアの確認に使います。",
    nextAction:
      "店舗や個人への注意表示ではなく、池袋エリアの公的な確認先としてリンクを整理する。",
  },
  {
    id: "shibuya-solicitation-declaration-list",
    areaSlug: "shibuya-dogenzaka-udagawacho",
    areaName: "渋谷・道玄坂・宇田川町",
    sourceType: "municipality",
    sourceTitle: "渋谷区の客引きしない宣言店資料",
    sourceUrl:
      "https://files.city.shibuya.tokyo.jp/assets/12995aba8b194961be709ba879857f70/c5172093828b4b44b6d3b59d0875ceee/20240305kannkyoujyoukatennpo.pdf",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "渋谷区が公開する、客引き抑止に関する取組資料です。店舗一覧の転載は行いません。",
    suggestedUse:
      "渋谷周辺の公的な取組確認に使い、店舗名や電話番号は本サービスへ転載しません。",
    nextAction:
      "資料の存在だけを記録し、個別店舗情報を公開ページや初期データCSVに転記しない。",
  },
  {
    id: "taito-solicitation-prevention-ordinance",
    areaSlug: "ueno-okachimachi-yushima",
    areaName: "上野・御徒町・湯島",
    sourceType: "municipality",
    sourceTitle: "台東区の客引き行為等の防止に関する案内",
    sourceUrl:
      "https://www.city.taito.lg.jp/bosai/bohantaisaku/anzentaisaku/kyakuhiki/kyakuhiki.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "台東区が、区内の客引き行為等の防止に関する取組を案内している公式ページです。",
    suggestedUse:
      "上野・御徒町周辺のエリア背景、入店前確認、相談導線の補足として参照します。",
    nextAction:
      "条例や取組の趣旨を独自要約し、個別店舗への注意表示には使わない。",
  },
  {
    id: "bunkyo-solicitation-countermeasures",
    areaSlug: "ueno-okachimachi-yushima",
    areaName: "上野・御徒町・湯島",
    sourceType: "municipality",
    sourceTitle: "文京区の客引き行為等への対策",
    sourceUrl: "https://www.city.bunkyo.lg.jp/b009/p000184.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "文京区が、客引き行為等への対策を案内している公式ページです。湯島周辺の背景確認に使います。",
    suggestedUse:
      "湯島周辺のエリア説明、公式確認先、相談導線の補足として参照します。",
    nextAction:
      "公的取組の要約に限定し、店舗名や個人名を含む情報は扱わない。",
  },
];

export function getResearchSourcesByArea(areaSlug: string) {
  return RESEARCH_SOURCES.filter(
    (source) => source.areaSlug === areaSlug || source.areaSlug === "all",
  );
}

export function getResearchSourceCsv() {
  const header = [
    "source_type",
    "source_url",
    "source_title",
    "source_checked_at",
    "observed_area",
    "research_status",
    "priority",
    "suggested_use",
    "extraction_policy",
    "next_action",
  ];

  const rows = RESEARCH_SOURCES.map((source) => [
    source.sourceType,
    source.sourceUrl,
    source.sourceTitle,
    source.sourceCheckedAt,
    source.areaName,
    "not_started",
    source.priority,
    source.suggestedUse,
    "本文、口コミ、画像、スクリーンショット、電話番号、個人情報は転載しない",
    source.nextAction,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");
}

export function getSourcePageUrl() {
  return `${SITE.url}/sources`;
}
