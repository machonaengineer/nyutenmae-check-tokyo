import { INITIAL_AREAS, SITE } from "@/lib/site";

export type ResearchSource = {
  id: string;
  areaSlug: string;
  areaName: string;
  sourceType:
    | "public_agency"
    | "police"
    | "consumer_center"
    | "municipality"
    | "news";
  sourceTitle: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  priority: "high" | "medium" | "low";
  publicSummary: string;
  suggestedUse: string;
  nextAction: string;
};

export type ResearchSourceIntakeStatus = "source_only" | "candidate_needs_review";

export type ResearchSourcePipelineMetrics = {
  totalSources: number;
  officialSources: number;
  newsSources: number;
  highPrioritySources: number;
  sourceOnlySources: number;
  candidateNeedsReviewSources: number;
};

export type ResearchSourceCoverageMetric = {
  areaSlug: string;
  areaName: string;
  areaSpecificSources: number;
  commonSources: number;
  highPrioritySources: number;
  candidateNeedsReviewSources: number;
  nextAction: string;
};

const initialDataCandidateSourceIds = new Set([
  "news-kabukicho-chain-claim-touting-202401",
  "news-kabukicho-billing-gap-202401",
  "news-ikebukuro-solicitation-billing-202202",
  "news-kabukicho-host-billing-202311",
  "news-kabukicho-app-bar-billing-202305",
  "news-kabukicho-chain-jcast-202402",
  "news-kabukicho-chain-joongang-202401",
  "news-kabukicho-chain-foodrink-202401",
  "news-kabukicho-chain-shueisha-202402",
  "news-kabukicho-host-fee-display-asahi-202312",
  "news-shibuya-matching-app-bar-livedoor-202505",
  "news-shibuya-bar-billing-chibatv-202505",
  "news-ikebukuro-receipt-video-getnews-202010",
  "news-ikebukuro-billing-detail-gogotsu-201807",
]);

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
  {
    id: "tokyo-consumer-host-concept-cafe-billing",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "consumer_center",
    sourceTitle: "東京都のホストクラブ等高額請求トラブル注意喚起",
    sourceUrl:
      "https://www.shouhiseikatu.metro.tokyo.lg.jp/hourei/oshirase/2024kougakuseikyu.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "東京都が、ホストクラブやコンセプトカフェ等での高額請求に関する相談事例と相談先を案内している公式ページです。",
    suggestedUse:
      "料金説明、明細提示、支払困難時の相談導線を補強し、個別店舗の断定には使いません。",
    nextAction:
      "相談事例は本文転載せず、入店前の料金確認と早期相談の案内へ独自要約する。",
  },
  {
    id: "mhlw-hostclub-support",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "public_agency",
    sourceTitle: "厚生労働省のホストクラブ関連相談支援情報",
    sourceUrl:
      "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/dv/index_00037.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "厚生労働省が、ホストクラブ利用に関連する支払困難や生活相談の支援先を案内しているページです。",
    suggestedUse:
      "消費生活相談だけで足りないケースの相談導線として参照し、店舗名や個人名の公開材料にはしません。",
    nextAction:
      "相談窓口の種別を整理し、サポートページの相談導線に必要な範囲だけ反映する。",
  },
  {
    id: "metropolitan-police-nightlife-crime-prevention",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "police",
    sourceTitle: "警視庁の繁華街利用時の犯罪被害注意喚起",
    sourceUrl:
      "https://www.keishicho.metro.tokyo.lg.jp/kurashi/anzen/live_in_tokyo/hankagai.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "警視庁が、繁華街での客引き経由の来店やクレジットカード決済に関する注意点を案内しているページです。",
    suggestedUse:
      "客引き経由の来店、支払方法、身の安全確保の一般的な注意喚起として参照します。",
    nextAction:
      "個別店舗の評価には使わず、入店前チェックリストと相談導線の補足に限定する。",
  },
  {
    id: "metropolitan-police-nightlife-risk-factors",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "police",
    sourceTitle: "警視庁の盛り場環境に関する注意喚起",
    sourceUrl:
      "https://www.keishicho.metro.tokyo.lg.jp/kurashi/anzen/sakaribasogo/sakariba2.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "警視庁が、盛り場での客引き行為や料金請求トラブルにつながる要因を説明しているページです。",
    suggestedUse:
      "エリア別ページの背景情報として使い、店舗や個人への断定表現には使いません。",
    nextAction:
      "本文転載を避け、入店前に確認すべき項目へ抽象化して反映する。",
  },
  {
    id: "metropolitan-police-nightlife-topics",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "police",
    sourceTitle: "警視庁の盛り場被害事例トピックス",
    sourceUrl:
      "https://www.keishicho.metro.tokyo.lg.jp/kurashi/anzen/sakaribasogo/sakaribatopics.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "警視庁が、盛り場でのトラブル事例や注意点を紹介しているページです。",
    suggestedUse:
      "会計前確認、キャンセル時対応、カード決済確認などのチェック項目を補強します。",
    nextAction:
      "事例文の転載は禁止とし、個別店舗名や地域外情報を公開注意報告へ転用しない。",
  },
  {
    id: "metropolitan-police-designated-waiting-areas",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "police",
    sourceTitle: "警視庁の客引き等の相手方となるべき者を待つ行為の規制区域",
    sourceUrl:
      "https://www.keishicho.metro.tokyo.lg.jp/about_mpd/keiyaku_horei_kohyo/horei_jorei/kyaku_ku.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "警視庁が、東京都公安委員会の指定区域として、客引き等の相手方となるべき者を待つ行為の規制区域を案内しているページです。",
    suggestedUse:
      "都内共通の背景情報として参照し、個別店舗や個人への注意表示には使いません。",
    nextAction:
      "区域名は背景確認に限定し、個別報告として扱う場合は投稿、証拠、現在状況を別途確認する。",
  },
  {
    id: "minato-solicitation-prevention-ordinance",
    areaSlug: "roppongi-azabujuban",
    areaName: "六本木・麻布十番",
    sourceType: "municipality",
    sourceTitle: "港区の客引き行為等の防止に関する条例案内",
    sourceUrl: "https://www.city.minato.tokyo.jp/seikatsuanzen/kyakuhikiboushi.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "港区が、公共の場所における客引き行為等の防止に関する条例と取組を案内している公式ページです。",
    suggestedUse:
      "六本木・麻布十番周辺のエリア背景、入店前確認、相談導線の補足に使います。",
    nextAction:
      "条例や取組の趣旨を独自要約し、個別店舗や個人への断定には使わない。",
  },
  {
    id: "minato-akasaka-solicitation-prevention",
    areaSlug: "akasaka-akasakamitsuke",
    areaName: "赤坂・赤坂見附",
    sourceType: "municipality",
    sourceTitle: "港区の赤坂地区を含む客引き行為等防止の取組",
    sourceUrl: "https://www.city.minato.tokyo.jp/seikatsuanzen/kyakuhikiboushi.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "港区の客引き行為等防止に関する公式情報です。赤坂周辺の背景確認に使います。",
    suggestedUse:
      "赤坂・赤坂見附周辺の料金説明、案内経由の来店、相談導線の確認材料にします。",
    nextAction:
      "区の取組を背景情報として整理し、個別店舗公開は承認済み投稿に限定する。",
  },
  {
    id: "minato-shimbashi-solicitation-prevention",
    areaSlug: "ginza-shimbashi-yurakucho",
    areaName: "銀座・新橋・有楽町",
    sourceType: "municipality",
    sourceTitle: "港区の新橋地区を含む客引き行為等防止の取組",
    sourceUrl: "https://www.city.minato.tokyo.jp/seikatsuanzen/kyakuhikiboushi.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "港区が、新橋を含む区内繁華街の客引き行為等防止に関する取組を案内している公式ページです。",
    suggestedUse:
      "銀座・新橋・有楽町周辺のうち、新橋側の公式確認先として整理します。",
    nextAction:
      "港区側の公的情報として扱い、中央区・千代田区側の情報と混同しない。",
  },
  {
    id: "chiyoda-solicitation-prevention-ordinance",
    areaSlug: "ginza-shimbashi-yurakucho",
    areaName: "銀座・新橋・有楽町",
    sourceType: "municipality",
    sourceTitle: "千代田区の公共の場所における客引き行為等防止条例案内",
    sourceUrl: "https://www.city.chiyoda.lg.jp/koho/machizukuri/sekatsu/kyakuhiki.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "千代田区が、公共の場所における客引き行為等の防止に関する条例と取組を案内している公式ページです。",
    suggestedUse:
      "有楽町側の背景情報として参照し、区をまたぐエリア表記の確認に使います。",
    nextAction:
      "区別の情報を分けて記録し、個別店舗の公開材料には直接使わない。",
  },
  {
    id: "chuo-consumer-center",
    areaSlug: "ginza-shimbashi-yurakucho",
    areaName: "銀座・新橋・有楽町",
    sourceType: "consumer_center",
    sourceTitle: "中央区消費生活センターの相談案内",
    sourceUrl: "https://www.city.chuo.lg.jp/consumercenter/index.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "中央区の消費生活センター公式ページです。銀座側の相談導線確認に使います。",
    suggestedUse:
      "会計内容や支払いに不安がある場合の相談導線として整理します。",
    nextAction:
      "受付条件と最新情報を人間確認し、サポートページの定期点検対象にする。",
  },
  {
    id: "sumida-kinshicho-solicitation-prevention",
    areaSlug: "kinshicho",
    areaName: "錦糸町",
    sourceType: "municipality",
    sourceTitle: "墨田区の客引き行為等の防止に関する条例案内",
    sourceUrl:
      "https://www.city.sumida.lg.jp/anzen_anshin/kurasinoanzen_ansin/kyakuhiki-bousi/kyakuhikikaisei.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "墨田区が、客引き行為等の防止に関する条例と錦糸町駅周辺を含む取組を案内している公式ページです。",
    suggestedUse:
      "錦糸町周辺のエリア背景、客引き経由の来店、相談導線の補足として参照します。",
    nextAction:
      "条例の趣旨を独自要約し、店舗や個人への注意表示には転用しない。",
  },
  {
    id: "shinagawa-gotanda-solicitation-prevention",
    areaSlug: "gotanda",
    areaName: "五反田",
    sourceType: "municipality",
    sourceTitle: "品川区の公共の場所における客引き行為等防止条例案内",
    sourceUrl:
      "https://www.city.shinagawa.tokyo.jp/PC/bosai/bosai-bohan/hpg000025697.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "品川区が、公共の場所における客引き行為等の防止に関する条例を案内している公式ページです。",
    suggestedUse:
      "五反田周辺の住所、重点地区、入店前確認の背景情報として参照します。",
    nextAction:
      "東五反田などの地域情報は背景確認に限定し、個別公開は承認済み投稿だけにする。",
  },
  {
    id: "tachikawa-safety-patrol",
    areaSlug: "tachikawa",
    areaName: "立川",
    sourceType: "municipality",
    sourceTitle: "立川市の安全・安心パトロール実施案内",
    sourceUrl:
      "https://www.city.tachikawa.lg.jp/bosai/bohan/1008438/1008446.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "立川市が、客引き、勧誘、客待ち、つきまとい等の迷惑行為防止とパトロールを案内している公式ページです。",
    suggestedUse:
      "立川駅周辺の入店前確認、相談導線、調査対象エリアの背景情報として使います。",
    nextAction:
      "パトロールや重点地区の趣旨を要約し、個別店舗評価に使わない。",
  },
  {
    id: "machida-station-patrol-release",
    areaSlug: "machida",
    areaName: "町田",
    sourceType: "municipality",
    sourceTitle: "町田市の町田駅周辺における客引き防止協働パトロール発表資料",
    sourceUrl:
      "https://www.city.machida.tokyo.jp/shisei/koho/faxrelease/2023/202307.files/103.pdf",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "町田市が、町田駅周辺での客引き防止協働パトロールに関する発表資料を公開しています。",
    suggestedUse:
      "町田駅周辺の公的な取組確認に使い、個別店舗や個人への断定には使いません。",
    nextAction:
      "資料の趣旨を独自要約し、最新の公式案内があるか定期確認する。",
  },
  {
    id: "musashino-kichijoji-blue-cap",
    areaSlug: "kichijoji",
    areaName: "吉祥寺",
    sourceType: "municipality",
    sourceTitle: "武蔵野市の安全パトロール隊と客引き行為等規制案内",
    sourceUrl:
      "https://www.city.musashino.lg.jp/kurashi_tetsuzuki/bosai_anzen/1040408/1040413.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "武蔵野市が、吉祥寺駅周辺を含む安全パトロール隊と客引き行為等への指導・警告を案内している公式ページです。",
    suggestedUse:
      "吉祥寺周辺の公的取組、入店前確認、相談導線の補足に使います。",
    nextAction:
      "公式ページの内容を独自要約し、店舗名や個人情報は扱わない。",
  },
  {
    id: "news-kabukicho-chain-claim-touting-202401",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町で既存チェーン関係者を装う客引き事案の報道",
    sourceUrl: "https://www.tokyo-sports.co.jp/articles/-/290541?page=1",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "報道では、既存チェーンの関係者を装う客引きと、別店舗への案内に関する事案が紹介されています。",
    suggestedUse:
      "個別店舗として公開する前に、店名、住所、現在状況、異議申立て導線、表現を管理者が再確認します。",
    nextAction:
      "非公開の初期データ候補CSVと照合し、公開できる場合も出典確認日と独自要約に限定する。",
  },
  {
    id: "news-kabukicho-billing-gap-202401",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町で系列店案内後の会計差異に関する報道",
    sourceUrl: "https://mezamashi.media/articles/-/20624",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "報道では、系列店案内を受けた利用者が会計時に説明と異なる金額を確認したとの証言が紹介されています。",
    suggestedUse:
      "客引き経由、料金説明、会計確認の注意喚起に使い、報道本文や画像は転載しません。",
    nextAction:
      "店名・住所が確定しない行は公開承認せず、エリア注意喚起やSNSの一般的な確認項目に転用する。",
  },
  {
    id: "news-ikebukuro-solicitation-billing-202202",
    areaSlug: "ikebukuro",
    areaName: "池袋",
    sourceType: "news",
    sourceTitle: "池袋で客引き経由の追加支払いに関する報道",
    sourceUrl: "https://news.tv-asahi.co.jp/news_society/articles/000246210.html",
    sourceCheckedAt: "2026-05-27",
    priority: "high",
    publicSummary:
      "報道では、豊島区西池袋の店舗について、客引き経由の来店と追加支払いに関する事案が紹介されています。",
    suggestedUse:
      "池袋エリアの客引き経由来店、会計前確認、相談導線の強化に使います。",
    nextAction:
      "店名未確認のため個別店舗として承認せず、追加出典が得られるまでneeds_reviewを維持する。",
  },
  {
    id: "news-kabukicho-host-billing-202311",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町ホストクラブ利用と高額支払いに関する報道",
    sourceUrl: "https://s.mxtv.jp/mxnews/article/chiiki/1etqjlg0fa1utasu2.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "報道では、歌舞伎町のホストクラブ利用をめぐる高額な支払い相談の文脈が紹介されています。",
    suggestedUse:
      "当サービスの対象である料金説明・会計確認に関わる範囲だけを審査し、別論点を混ぜないようにします。",
    nextAction:
      "公開候補にする場合は、現在状況と権利侵害リスクを確認し、表現を管理者が再編集する。",
  },
  {
    id: "news-kabukicho-app-bar-billing-202305",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町1丁目の飲み放題条件と会計対応に関する報道",
    sourceUrl: "https://www.asahi.com/articles/ASR5K76S8R5KUTIL007.html",
    sourceCheckedAt: "2026-05-27",
    priority: "medium",
    publicSummary:
      "報道では、飲み放題条件や会計時対応について利用者側との認識差があった事案が紹介されています。",
    suggestedUse:
      "飲み放題条件、明細確認、退店時の安全確保に関する確認項目の補強に使います。",
    nextAction:
      "店名未確認のため、個別店舗公開ではなく確認項目と相談導線の改善材料として扱う。",
  },
  {
    id: "news-kabukicho-chain-jcast-202402",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町でチェーン系列店を装う客引き手口に関する報道",
    sourceUrl: "https://www.j-cast.com/2024/02/02477448.html?=p2",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "報道では、既存チェーンの関係者を装う案内、別店舗への誘導、料金説明と会計内容の確認が必要な事案が紹介されています。",
    suggestedUse:
      "客引き経由の来店と系列店を装う案内の確認項目を補強します。記事本文、画像、店舗名の転記は行いません。",
    nextAction:
      "同じ事案を扱う他媒体と照合し、個別店舗として扱う場合も現在状況、住所、異議申立て導線を確認する。",
  },
  {
    id: "news-kabukicho-chain-joongang-202401",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町で外国人観光客向け案内と料金上乗せに関する報道",
    sourceUrl: "https://japanese.joins.com/JArticle/314429?sectcode=A10&servcode=A00",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "報道では、外国人観光客が既存チェーンの系列店と誤認しやすい案内を受け、別店舗へ誘導された事案が紹介されています。",
    suggestedUse:
      "訪日客向けの入店前確認、系列店確認、店頭での料金確認の導線に使います。本文や写真は転載しません。",
    nextAction:
      "日本語媒体の報道と照合し、個別公開ではなく多言語チェックリストの改善材料として扱う。",
  },
  {
    id: "news-kabukicho-chain-foodrink-202401",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町でチェーン系列店を名乗る客引きに関する外食業界記事",
    sourceUrl: "https://www.foodrink.co.jp/news/2024/01/3055839.html",
    sourceCheckedAt: "2026-05-28",
    priority: "medium",
    publicSummary:
      "外食業界向け記事では、既存チェーンの利用客に対する案内と別店舗への誘導が取り上げられています。",
    suggestedUse:
      "同一事案の複数出典確認に使い、店舗名や個人情報の公開材料には直接使いません。",
    nextAction:
      "高優先の報道と突合し、公開候補は非公開審査DBでneeds_reviewのまま扱う。",
  },
  {
    id: "news-kabukicho-chain-shueisha-202402",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町で大手チェーン利用客を狙う案内手口の詳細報道",
    sourceUrl: "https://shueisha.online/articles/-/194300",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "報道では、既存チェーン利用客への案内、席料やサービス料などの名目、会計時の確認点が紹介されています。",
    suggestedUse:
      "料金説明と会計内容の不一致報告候補を審査する際の背景確認に使います。本文、画像、個人名は転載しません。",
    nextAction:
      "記事内の店舗画像や店名を転載せず、住所、建物、現在状況を別途確認できる場合だけ候補化する。",
  },
  {
    id: "news-kabukicho-host-fee-display-asahi-202312",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "news",
    sourceTitle: "歌舞伎町ホストクラブ等の料金表示義務に関する報道",
    sourceUrl: "https://www.asahi.com/articles/ASRDM42NCRDMUTIL00K.html",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "報道では、警視庁の立入結果として、料金表示や従業員名簿に関する確認事項が紹介されています。",
    suggestedUse:
      "個別店舗ではなく、料金表示、メニュー確認、明細確認のエリア共通ガイドを補強します。",
    nextAction:
      "店名一覧として扱わず、公開ページではエリア単位の確認項目と相談導線に限定する。",
  },
  {
    id: "municipality-shinjuku-host-mencon-response-202311",
    areaSlug: "shinjuku-kabukicho",
    areaName: "新宿・歌舞伎町",
    sourceType: "municipality",
    sourceTitle: "新宿区のホストクラブ等高額請求被害対策ページ",
    sourceUrl: "https://www.city.shinjuku.lg.jp/whatsnew/pub/2023/1117-01.html",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "新宿区が、歌舞伎町地区での高額請求被害対策と関係機関との連携方針を案内している公式ページです。",
    suggestedUse:
      "公的な背景情報として、相談導線、エリア説明、公開表現の確認に使います。",
    nextAction:
      "個別店舗への断定に使わず、サポートページと歌舞伎町エリアページの公式確認先として維持する。",
  },
  {
    id: "news-shibuya-matching-app-bar-livedoor-202505",
    areaSlug: "shibuya-dogenzaka-udagawacho",
    areaName: "渋谷・道玄坂・宇田川町",
    sourceType: "news",
    sourceTitle: "渋谷・道玄坂でマッチングアプリ経由の高額請求疑いに関する報道",
    sourceUrl: "https://news.livedoor.com/article/detail/28769638/",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "報道では、マッチングアプリで知り合った相手から飲食店へ誘導され、支払い前後の説明に関するトラブルが紹介されています。",
    suggestedUse:
      "客引き以外の誘導経路、支払い困難時の説明、ATM誘導への注意喚起に使います。",
    nextAction:
      "個別店舗名や個人名は公開せず、道玄坂エリアの確認項目と非公開審査候補に分けて扱う。",
  },
  {
    id: "news-shibuya-bar-billing-chibatv-202505",
    areaSlug: "shibuya-dogenzaka-udagawacho",
    areaName: "渋谷・道玄坂・宇田川町",
    sourceType: "news",
    sourceTitle: "渋谷区のバーで高額な支払い要求に関する共同通信配信記事",
    sourceUrl: "https://www.chiba-tv.com/plus/detail/202505224897",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "共同通信配信記事では、渋谷区のバーで高額な支払い要求に関する事案が紹介されています。",
    suggestedUse:
      "マッチングアプリ経由の来店、飲み放題条件、支払い前の金額確認に関する導線を補強します。",
    nextAction:
      "共同通信配信の短報のため、追加出典、現在状況、住所、建物、階数を確認するまで個別公開しない。",
  },
  {
    id: "municipality-shibuya-administrative-actions-202604",
    areaSlug: "shibuya-dogenzaka-udagawacho",
    areaName: "渋谷・道玄坂・宇田川町",
    sourceType: "municipality",
    sourceTitle: "渋谷区の客引き行為等に関する行政処分公表ページ",
    sourceUrl:
      "https://www.city.shibuya.tokyo.jp/bosai/bohan/bohan-torikumi/kyakuhikikouhyou.html",
    sourceCheckedAt: "2026-05-28",
    priority: "high",
    publicSummary:
      "渋谷区が、条例に基づく行政処分、規制区域、店舗等への立入調査件数を公表している公式ページです。",
    suggestedUse:
      "宇田川町、道玄坂周辺の公的確認先として使い、個人名や住所は本サービスへ転載しません。",
    nextAction:
      "行政処分の公表情報は個別投稿に転用せず、エリア背景と相談導線の補強に限定する。",
  },
  {
    id: "news-ikebukuro-receipt-video-getnews-202010",
    areaSlug: "ikebukuro",
    areaName: "池袋",
    sourceType: "news",
    sourceTitle: "池袋の飲食店で明細内容に関する利用者投稿を扱った記事",
    sourceUrl: "https://getnews.jp/archives/2791173",
    sourceCheckedAt: "2026-05-28",
    priority: "medium",
    publicSummary:
      "記事では、客引き経由の案内、説明された条件、会計時の明細内容に関する利用者投稿が紹介されています。",
    suggestedUse:
      "明細提示、注文内容、退店時対応の確認項目に使います。外部投稿本文や動画は転載しません。",
    nextAction:
      "外部投稿由来のため、追加出典、現在状況、建物情報を確認するまで個別公開しない。",
  },
  {
    id: "news-ikebukuro-billing-detail-gogotsu-201807",
    areaSlug: "ikebukuro",
    areaName: "池袋",
    sourceType: "news",
    sourceTitle: "池袋の飲食店で請求内訳が紹介された記事",
    sourceUrl: "https://gogotsu.com/archives/41472",
    sourceCheckedAt: "2026-05-28",
    priority: "medium",
    publicSummary:
      "記事では、西池袋周辺の飲食店について、料理点数、請求総額、席料等の内訳が紹介されています。",
    suggestedUse:
      "席料、週末料金、サービス料などの事前説明確認のガイドに使います。店名変更の可能性は別途確認します。",
    nextAction:
      "店名が変わる可能性を前提に、住所、建物、階数を優先し、同一店舗とは断定しない。",
  },
  {
    id: "news-ueno-solicitation-patrol-spa-201901",
    areaSlug: "ueno-okachimachi-yushima",
    areaName: "上野・御徒町・湯島",
    sourceType: "news",
    sourceTitle: "上野周辺の客引き取締り状況に関する取材記事",
    sourceUrl: "https://nikkan-spa.jp/1540583",
    sourceCheckedAt: "2026-05-28",
    priority: "medium",
    publicSummary:
      "取材記事では、上野周辺の客引き取締り、地域事情、警察対応の背景が紹介されています。",
    suggestedUse:
      "個別店舗ではなく、上野・御徒町・湯島エリアの背景情報と相談導線の補強に使います。",
    nextAction:
      "取材コメントや個人情報は転載せず、公式ソースと照合してエリア説明へ抽象化する。",
  },
  {
    id: "news-national-consumer-bar-billing-nlab-201603",
    areaSlug: "all",
    areaName: "都内共通",
    sourceType: "news",
    sourceTitle: "国民生活センターの飲食店高額請求トラブル注意喚起を扱った記事",
    sourceUrl: "https://nlab.itmedia.co.jp/cont/articles/3253023/",
    sourceCheckedAt: "2026-05-28",
    priority: "medium",
    publicSummary:
      "記事では、国民生活センターの注意喚起として、客引き経由の来店、支払い、カード利用に関する相談事例が紹介されています。",
    suggestedUse:
      "全エリア共通の入店前確認、カード相談、記録保存のガイドを補強します。",
    nextAction:
      "国民生活センターの元資料が再確認できるまで、記事の本文を転載せず、一般的な確認項目に限定する。",
  },
];

export function getResearchSourcesByArea(areaSlug: string) {
  return RESEARCH_SOURCES.filter(
    (source) => source.areaSlug === areaSlug || source.areaSlug === "all",
  );
}

export function getResearchSourceIntakeStatus(
  source: ResearchSource,
): ResearchSourceIntakeStatus {
  return initialDataCandidateSourceIds.has(source.id)
    ? "candidate_needs_review"
    : "source_only";
}

export function getResearchSourcePipelineMetrics(): ResearchSourcePipelineMetrics {
  return RESEARCH_SOURCES.reduce<ResearchSourcePipelineMetrics>(
    (metrics, source) => {
      const status = getResearchSourceIntakeStatus(source);

      metrics.totalSources += 1;
      metrics.highPrioritySources += source.priority === "high" ? 1 : 0;
      metrics.newsSources += source.sourceType === "news" ? 1 : 0;
      metrics.officialSources += source.sourceType === "news" ? 0 : 1;
      metrics.sourceOnlySources += status === "source_only" ? 1 : 0;
      metrics.candidateNeedsReviewSources +=
        status === "candidate_needs_review" ? 1 : 0;

      return metrics;
    },
    {
      totalSources: 0,
      officialSources: 0,
      newsSources: 0,
      highPrioritySources: 0,
      sourceOnlySources: 0,
      candidateNeedsReviewSources: 0,
    },
  );
}

export function getResearchSourceCoverageMetrics(): ResearchSourceCoverageMetric[] {
  const commonSources = RESEARCH_SOURCES.filter((source) => source.areaSlug === "all");

  return INITIAL_AREAS.map((area) => {
    const areaSources = RESEARCH_SOURCES.filter((source) => source.areaSlug === area.slug);
    const allAreaSources = [...areaSources, ...commonSources];
    const candidateNeedsReviewSources = areaSources.filter(
      (source) => getResearchSourceIntakeStatus(source) === "candidate_needs_review",
    ).length;

    return {
      areaSlug: area.slug,
      areaName: area.name,
      areaSpecificSources: areaSources.length,
      commonSources: commonSources.length,
      highPrioritySources: allAreaSources.filter((source) => source.priority === "high")
        .length,
      candidateNeedsReviewSources,
      nextAction:
        candidateNeedsReviewSources > 0
          ? "候補化済みの出典を、pending / Hidden のまま審査します。"
          : "公式確認先と投稿導線を整え、個別報告は根拠確認後に候補化します。",
    };
  });
}

export function filterResearchSourcesByQuery(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  return RESEARCH_SOURCES.filter((source) => {
    const searchableText = [
      source.areaName,
      source.sourceTitle,
      source.publicSummary,
      source.suggestedUse,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchableText.includes(term));
  });
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
    getResearchSourceIntakeStatus(source) === "candidate_needs_review"
      ? "imported_needs_review"
      : "not_started",
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
