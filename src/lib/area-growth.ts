import { INITIAL_AREAS } from "@/lib/site";

export type AreaGrowthPriority = "highest" | "high" | "medium";

export type AreaGrowthPlan = {
  areaSlug: string;
  areaName: string;
  priority: AreaGrowthPriority;
  searchIntent: string;
  immediateDataNeed: string;
  adminNextAction: string;
  publicZeroStateValue: string;
  contributionAsk: string;
  snsTemplate: string;
  monetizationGate: string;
};

export const AREA_GROWTH_PRIORITY_LABELS: Record<AreaGrowthPriority, string> = {
  highest: "最優先",
  high: "優先",
  medium: "通常",
};

const growthPlanBySlug: Record<
  string,
  Omit<AreaGrowthPlan, "areaSlug" | "areaName">
> = {
  "shinjuku-kabukicho": {
    priority: "highest",
    searchIntent: "歌舞伎町で入店前に料金説明、明細、客引き経由の注意点を確認したい",
    immediateDataNeed:
      "公式注意喚起、相談導線、客引き経由の説明差、建物名、階数を優先して整理する",
    adminNextAction:
      "候補審査DBの歌舞伎町関連行を、出典確認、建物確認、公開サマリー確認の順に処理する",
    publicZeroStateValue:
      "公開投稿がない状態でも、入店前の総額確認、明細保存、相談先を確認できるページにする",
    contributionAsk:
      "案内を受けた場所、入店先の建物名、会計前説明、明細提示の有無を分けて提供してもらう",
    snsTemplate:
      "歌舞伎町周辺で入店前に見る確認リスト。料金説明、明細、支払い控えを保存してから判断を。",
    monetizationGate:
      "検索流入と投稿導線が安定するまで広告表示は控え、相談導線と信頼表示を優先する",
  },
  ikebukuro: {
    priority: "highest",
    searchIntent: "池袋で客引き経由の来店前に、料金条件と会計時の確認点を知りたい",
    immediateDataNeed:
      "西口、東口、建物名、階数、飲み放題条件、追加費目の説明差を候補化する",
    adminNextAction:
      "池袋関連の報道候補は店名断定を避け、エリア注意情報か非公開投稿候補に分ける",
    publicZeroStateValue:
      "公開投稿ゼロでも、駅周辺で確認する料金条件と保存資料をすぐ見られる状態にする",
    contributionAsk:
      "案内地点、実際に入店した住所、飲み放題条件、会計時説明を時系列で提供してもらう",
    snsTemplate:
      "池袋周辺で入店前に確認したいこと。店名、住所、時間制、飲み放題条件を先に共有。",
    monetizationGate:
      "エリア別検索流入が増えるまではスポンサーより情報提供率を優先する",
  },
  "shibuya-dogenzaka-udagawacho": {
    priority: "high",
    searchIntent: "渋谷、道玄坂、宇田川町で入店前の料金確認と客引き抑止情報を見たい",
    immediateDataNeed:
      "渋谷区の公式資料は店舗一覧を転載せず、入店前確認と相談導線に抽象化する",
    adminNextAction:
      "公式資料由来の候補は個別店舗化せず、エリアページとチェックリストの補強へ回す",
    publicZeroStateValue:
      "公開投稿がない状態でも、道玄坂・宇田川町周辺で入店前に比較すべき条件を表示する",
    contributionAsk:
      "案内経路、入店前説明、店内説明、会計時に変わった費目を分けて提供してもらう",
    snsTemplate:
      "渋谷周辺の入店前確認。席料、サービス料、税、時間制を総額で確認。",
    monetizationGate:
      "若年層流入が多い想定のため、広告より安全確保と相談導線を優先する",
  },
  "ueno-okachimachi-yushima": {
    priority: "high",
    searchIntent: "上野、御徒町、湯島で住所や区境を含めて相談先と確認点を知りたい",
    immediateDataNeed:
      "台東区、文京区の公式情報を分け、湯島側と上野側の住所確認を強める",
    adminNextAction:
      "候補の observed_area と住所が混ざらないよう、エリア単位の補助情報として整理する",
    publicZeroStateValue:
      "区をまたぐエリアでも、相談先と入店前の保存項目が迷わず分かる状態にする",
    contributionAsk:
      "台東区側か文京区側か、建物名、階数、明細提示の経緯を提供してもらう",
    snsTemplate:
      "上野・御徒町・湯島周辺では、住所と建物名を保存してから会計内容を確認。",
    monetizationGate:
      "エリア理解の価値を高め、広告掲載より公的確認先の信頼性を先に育てる",
  },
  "roppongi-azabujuban": {
    priority: "high",
    searchIntent: "六本木、麻布十番で深夜帯や紹介経由の料金確認をしたい",
    immediateDataNeed:
      "港区公式情報、深夜料金、サービス料、外国語説明、カード決済確認を整理する",
    adminNextAction:
      "建物名と階数のある候補を優先し、支払方法と説明内容を分けて審査する",
    publicZeroStateValue:
      "深夜帯でも、支払い前に確認する項目と相談先が分かるページにする",
    contributionAsk:
      "紹介経由か案内経由か、決済端末表示、控え、後日の請求明細を提供してもらう",
    snsTemplate:
      "六本木・麻布十番では、深夜料金、サービス料、税、カード決済額を支払い前に確認。",
    monetizationGate:
      "高単価広告よりも、掲載独立性と相談導線の信頼を優先する",
  },
  "ginza-shimbashi-yurakucho": {
    priority: "high",
    searchIntent: "銀座、新橋、有楽町で区をまたぐ繁華街の料金確認をしたい",
    immediateDataNeed:
      "中央区、港区、千代田区の確認先を分け、駅周辺と住所の対応を整理する",
    adminNextAction:
      "新橋側、有楽町側、銀座側を混同しないよう source と area の紐付けを確認する",
    publicZeroStateValue:
      "区別の公式確認先と、会計前に確認すべき費目を一画面で分かるようにする",
    contributionAsk:
      "最寄り駅、区名、建物名、席料・サービス料・税の説明を提供してもらう",
    snsTemplate:
      "銀座・新橋・有楽町周辺では、区名、住所、建物名、会計前説明をセットで保存。",
    monetizationGate:
      "ビジネス利用流入が見込めても、スポンサー審査基準が整うまで広告色を薄くする",
  },
  "akasaka-akasakamitsuke": {
    priority: "medium",
    searchIntent: "赤坂、赤坂見附で紹介経由や時間制条件の確認をしたい",
    immediateDataNeed:
      "港区公式情報、紹介経由、時間制、飲み放題条件、延長条件の確認項目を増やす",
    adminNextAction:
      "赤坂関連候補は、紹介経由と客引き経由を混ぜずに非公開審査へ回す",
    publicZeroStateValue:
      "公開投稿ゼロでも、時間制条件と会計前確認のチェックができる状態にする",
    contributionAsk:
      "紹介経由、予約経由、案内経由の別と、条件説明の差を提供してもらう",
    snsTemplate:
      "赤坂・赤坂見附周辺では、時間制、延長条件、飲み放題対象を注文前に確認。",
    monetizationGate:
      "投稿数が少ない段階では広告より候補収集とエリアSEOを優先する",
  },
  kinshicho: {
    priority: "medium",
    searchIntent: "錦糸町で客引き経由や明細提示の確認点を知りたい",
    immediateDataNeed:
      "墨田区公式情報、駅周辺、建物内店舗、明細提示の確認項目を増やす",
    adminNextAction:
      "錦糸町候補は住所と建物名がそろうまで個別公開に進めない",
    publicZeroStateValue:
      "公開投稿ゼロでも、明細提示と退店時の安全確保を確認できる状態にする",
    contributionAsk:
      "案内地点、入店先建物名、明細提示の有無、退店時対応を提供してもらう",
    snsTemplate:
      "錦糸町周辺では、建物名、階数、明細提示の有無を会計前後で保存。",
    monetizationGate:
      "地域検索流入の実績を見てから広告実験を検討する",
  },
  gotanda: {
    priority: "medium",
    searchIntent: "五反田で住所、建物、会計前説明を確認したい",
    immediateDataNeed:
      "品川区公式情報、東五反田・西五反田、建物名、カード決済控えを整理する",
    adminNextAction:
      "五反田候補は住所区分と建物名を確認し、投稿フォーム誘導へつなげる",
    publicZeroStateValue:
      "公開投稿ゼロでも、カード控えと後日請求の確認手順を示す",
    contributionAsk:
      "住所区分、建物名、時間制、会計前説明、カード控えを提供してもらう",
    snsTemplate:
      "五反田周辺では、住所、建物、会計前説明、カード控えをセットで確認。",
    monetizationGate:
      "交通流入と投稿獲得が伸びるまでは収益枠より信頼表示を優先する",
  },
  tachikawa: {
    priority: "medium",
    searchIntent: "立川で駅周辺の料金確認と相談導線を知りたい",
    immediateDataNeed:
      "立川市公式情報、駅周辺、時間制、明細提示、相談導線を整理する",
    adminNextAction:
      "多摩エリアの入口として、公式確認先と投稿誘導を先に整える",
    publicZeroStateValue:
      "都心外エリアでも入店前確認と相談先を確認できる状態にする",
    contributionAsk:
      "立川駅周辺の案内地点、入店前説明、明細提示、相談先への連絡有無を提供してもらう",
    snsTemplate:
      "立川周辺の入店前確認。時間制、席料、明細提示、相談先を先にチェック。",
    monetizationGate:
      "掲載エリア拡大の実験対象として、広告より検索流入と投稿率を見る",
  },
  machida: {
    priority: "medium",
    searchIntent: "町田で駅周辺の案内経路と会計確認を知りたい",
    immediateDataNeed:
      "町田市公式資料、駅周辺、案内経路、住所、建物名、会計前説明を整理する",
    adminNextAction:
      "PDF資料は本文転載せず、公式ソース確認とエリア注意導線へ抽象化する",
    publicZeroStateValue:
      "公開投稿ゼロでも、町田駅周辺の情報提供に必要な粒度を示す",
    contributionAsk:
      "案内経路、住所、建物名、会計時に確認した費目を提供してもらう",
    snsTemplate:
      "町田駅周辺では、案内経路、住所、建物名、会計時の追加費目を保存。",
    monetizationGate:
      "投稿獲得の実績が出るまで、収益化はスポンサー相談の受け口に限定する",
  },
  kichijoji: {
    priority: "medium",
    searchIntent: "吉祥寺で駅周辺や商店街の入店前確認をしたい",
    immediateDataNeed:
      "武蔵野市公式情報、商店街、建物名、階数、最低注文条件を整理する",
    adminNextAction:
      "更新済みの武蔵野市公式ページを確認し、候補の公式URLを最新化する",
    publicZeroStateValue:
      "公開投稿ゼロでも、吉祥寺駅周辺で保存すべき場所情報を分かるようにする",
    contributionAsk:
      "通り名、建物名、階数、最低注文条件、会計前説明を提供してもらう",
    snsTemplate:
      "吉祥寺周辺では、通り名、建物名、階数、最低注文条件を入店前に確認。",
    monetizationGate:
      "地域密着の流入を育て、広告掲載は公開情報の独立性を保てる場合だけ検討する",
  },
};

export function getAreaGrowthPlan(areaSlug: string): AreaGrowthPlan | null {
  const area = INITIAL_AREAS.find((item) => item.slug === areaSlug);
  const plan = growthPlanBySlug[areaSlug];

  if (!area || !plan) {
    return null;
  }

  return {
    areaSlug: area.slug,
    areaName: area.name,
    ...plan,
  };
}

export function getAreaGrowthPlans(): AreaGrowthPlan[] {
  return INITIAL_AREAS.map((area) => getAreaGrowthPlan(area.slug)).filter(
    (plan): plan is AreaGrowthPlan => plan !== null,
  );
}

export function getPrioritySortedAreaGrowthPlans(): AreaGrowthPlan[] {
  const priorityOrder: Record<AreaGrowthPriority, number> = {
    highest: 0,
    high: 1,
    medium: 2,
  };

  return [...getAreaGrowthPlans()].sort(
    (left, right) =>
      priorityOrder[left.priority] - priorityOrder[right.priority] ||
      left.areaName.localeCompare(right.areaName, "ja"),
  );
}
