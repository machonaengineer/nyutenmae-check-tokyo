export const SITE = {
  name: "入店前チェック東京",
  description:
    "キャッチについて行く前に見る、都内繁華街の注意マップ",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "ホーム", emphasis: false },
  { href: "/map", label: "地図", emphasis: false },
  { href: "/areas", label: "エリア", emphasis: false },
  { href: "/guides", label: "実用ガイド", emphasis: false },
  { href: "/support", label: "相談先", emphasis: false },
  { href: "/reports/quick", label: "投稿する", emphasis: true },
] as const;

export const FOOTER_LINKS = [
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシー" },
  { href: "/guidelines", label: "投稿ガイドライン" },
  { href: "/checklists", label: "確認リスト" },
  { href: "/guides", label: "実用ガイド" },
  { href: "/topics", label: "種別ガイド" },
  { href: "/contribute", label: "情報提供" },
  { href: "/sources", label: "情報ソース" },
  { href: "/coverage", label: "情報蓄積状況" },
  { href: "/coverage/candidates", label: "公開候補化の流れ" },
  { href: "/trust", label: "掲載方針" },
  { href: "/social", label: "SNS共有" },
  { href: "/roadmap", label: "改善ロードマップ" },
  { href: "/support", label: "相談先" },
  { href: "/objection", label: "異議申立て" },
  { href: "/monetization-policy", label: "収益化方針" },
  { href: "/sponsor", label: "スポンサー" },
] as const;

export const INITIAL_AREAS = [
  {
    slug: "shinjuku-kabukicho",
    name: "新宿・歌舞伎町",
    summary: "客引き経由の来店、料金説明、会計確認に関する報告を扱います。",
    center: "新宿区歌舞伎町周辺",
    coordinates: { latitude: 35.695, longitude: 139.7036 },
  },
  {
    slug: "ikebukuro",
    name: "池袋",
    summary: "西口、東口周辺の入店前確認に役立つ注意情報を整理します。",
    center: "豊島区池袋周辺",
    coordinates: { latitude: 35.7295, longitude: 139.7109 },
  },
  {
    slug: "shibuya-dogenzaka-udagawacho",
    name: "渋谷・道玄坂・宇田川町",
    summary: "繁華街での料金説明と会計内容の不一致報告を中心に扱います。",
    center: "渋谷区道玄坂、宇田川町周辺",
    coordinates: { latitude: 35.6595, longitude: 139.6986 },
  },
  {
    slug: "ueno-okachimachi-yushima",
    name: "上野・御徒町・湯島",
    summary: "退店時対応や明細提示に関する注意報告を整理します。",
    center: "台東区、文京区の対象周辺",
    coordinates: { latitude: 35.7085, longitude: 139.7745 },
  },
  {
    slug: "roppongi-azabujuban",
    name: "六本木・麻布十番",
    summary: "深夜帯の料金説明、会計確認、退店時対応に関する注意情報を整理します。",
    center: "港区六本木、麻布十番周辺",
    coordinates: { latitude: 35.6628, longitude: 139.7314 },
  },
  {
    slug: "ginza-shimbashi-yurakucho",
    name: "銀座・新橋・有楽町",
    summary: "駅周辺や飲食店集積エリアでの入店前説明と会計確認を扱います。",
    center: "中央区、港区、千代田区の対象周辺",
    coordinates: { latitude: 35.6687, longitude: 139.763 },
  },
  {
    slug: "akasaka-akasakamitsuke",
    name: "赤坂・赤坂見附",
    summary: "客引き経由の来店、席料やサービス料の説明確認に関する情報を扱います。",
    center: "港区赤坂、赤坂見附周辺",
    coordinates: { latitude: 35.6763, longitude: 139.737 },
  },
  {
    slug: "kinshicho",
    name: "錦糸町",
    summary: "繁華街での料金説明、明細提示、会計時対応に関する注意情報を整理します。",
    center: "墨田区錦糸町周辺",
    coordinates: { latitude: 35.696, longitude: 139.8145 },
  },
  {
    slug: "gotanda",
    name: "五反田",
    summary: "駅周辺の入店前説明、会計内容、明細提示に関する報告を扱います。",
    center: "品川区五反田周辺",
    coordinates: { latitude: 35.6264, longitude: 139.7234 },
  },
  {
    slug: "tachikawa",
    name: "立川",
    summary: "多摩エリアの繁華街における料金確認と会計確認の注意情報を整理します。",
    center: "立川市中心部周辺",
    coordinates: { latitude: 35.6984, longitude: 139.4137 },
  },
  {
    slug: "machida",
    name: "町田",
    summary: "駅周辺での入店前説明、支払い前の金額確認、相談導線を整理します。",
    center: "町田市中心部周辺",
    coordinates: { latitude: 35.5429, longitude: 139.4458 },
  },
  {
    slug: "kichijoji",
    name: "吉祥寺",
    summary: "駅周辺の飲食店集積エリアでの料金説明と明細確認に関する情報を扱います。",
    center: "武蔵野市吉祥寺周辺",
    coordinates: { latitude: 35.7031, longitude: 139.5797 },
  },
] as const;

export const REPORT_CATEGORIES = [
  "客引き経由の来店報告",
  "料金説明と会計内容の不一致報告",
  "明細提示に関する報告",
  "会計時対応に関する注意報告",
  "退店時対応に関する報告",
] as const;

export const EVIDENCE_LEVELS = [
  {
    label: "S",
    description: "複数の確認資料があり、管理者が公開表現を精査した報告です。",
  },
  {
    label: "A",
    description: "領収書、明細、写真などの資料が添付されている報告です。",
  },
  {
    label: "B",
    description: "具体的な経緯があり、補足確認が必要な報告です。",
  },
  {
    label: "C",
    description: "投稿者の申告が中心で、公開前に追加確認を行う報告です。",
  },
  {
    label: "D",
    description: "情報が限定的で、公開可否を慎重に判断する報告です。",
  },
  {
    label: "Hidden",
    description: "非公開管理用。初回投稿はこの状態から審査します。",
  },
] as const;

export const RISK_TAGS = [
  { slug: "solicited-entry", label: "客引き経由の来店報告あり" },
  {
    slug: "price-billing-mismatch",
    label: "料金説明と会計内容の不一致報告あり",
  },
  {
    slug: "all-you-can-drink-condition-mismatch",
    label: "飲み放題条件の不一致報告あり",
  },
  {
    slug: "seat-service-fee-insufficient-explanation",
    label: "席料・サービス料の説明不足報告あり",
  },
  { slug: "itemized-bill-trouble", label: "明細提示に関するトラブル報告あり" },
  {
    slug: "checkout-response-attention",
    label: "会計時対応に関する注意報告あり",
  },
  { slug: "exit-response-attention", label: "退店時対応に関する注意報告あり" },
  { slug: "high-billing-trouble", label: "高額請求トラブル報告あり" },
  { slug: "similar-reports-same-address", label: "同一住所・同一建物で類似報告あり" },
  { slug: "objection-filed", label: "店舗側より異議申立てあり" },
  { slug: "under-review", label: "確認中" },
] as const;

export const PUBLICATION_RULES = [
  "送信内容は確認後に掲載します。",
  "公開できる情報だけを表示します。",
  "添付資料と連絡先は公開ページに出しません。",
  "味、雰囲気、通常接客の評価は扱いません。",
] as const;

export const TONE_GUIDELINES = [
  "料金、条件、明細など確認しやすい項目を中心に表示します。",
  "確認中の情報は状態を分けて扱います。",
  "入店前の料金確認を推奨します。",
  "必要以上に強い表現は避けます。",
] as const;
