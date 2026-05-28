import "server-only";
import { INITIAL_DATA_COLUMNS, parseCsv } from "@/lib/initial-data-validation";

const STAGEABLE_AREAS = new Set([
  "新宿・歌舞伎町",
  "池袋",
  "渋谷・道玄坂・宇田川町",
  "上野・御徒町・湯島",
  "六本木・麻布十番",
  "銀座・新橋・有楽町",
  "赤坂・赤坂見附",
  "錦糸町",
  "五反田",
  "立川",
  "町田",
  "吉祥寺",
]);

export const MEDIA_EVIDENCE_CANDIDATES_CSV = String.raw`source_type,source_url,source_title,source_checked_at,observed_area,place_name,address,building_name,floor,incident_type,risk_tags,evidence_level,public_summary,private_memo,status,reviewed_by_admin,published_at
news,https://www.j-cast.com/2024/02/02477448.html?=p2,歌舞伎町でチェーン系列店を装う客引き手口に関する報道,2026-05-28,新宿・歌舞伎町,非公開確認候補,,,,客引き経由の来店・料金説明確認,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり;高額請求トラブル報告あり,Hidden,報道では、既存チェーンの関係者を装う案内と別店舗への誘導が紹介されています。公開前に現在状況と表現を確認します。,証拠シグナル: 報道写真あり、チェーン店側取材あり、同一事案の複数媒体照合対象。記事本文、画像、店舗名、個人情報は転載しない。,needs_review,,
news,https://japanese.joins.com/JArticle/314429?sectcode=A10&servcode=A00,歌舞伎町で外国人観光客向け案内と料金上乗せに関する報道,2026-05-28,新宿・歌舞伎町,非公開確認候補,,,,客引き経由の来店・料金上乗せ確認,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり;高額請求トラブル報告あり,Hidden,報道では、外国人観光客が既存チェーンの系列店と誤認しやすい案内を受けた事案が紹介されています。,証拠シグナル: 海外媒体による報道、外国人観光客向け手口の確認材料。原文や写真は転載しない。,needs_review,,
news,https://www.foodrink.co.jp/news/2024/01/3055839.html,歌舞伎町でチェーン系列店を名乗る客引きに関する外食業界記事,2026-05-28,新宿・歌舞伎町,非公開確認候補,,,,客引き経由の来店・系列店確認,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり,Hidden,外食業界向け記事では、既存チェーンの利用客に対する案内と別店舗への誘導が取り上げられています。,証拠シグナル: 業界媒体記事、既存チェーン名を装う手口の補助出典。個別店舗公開には使わず照合に使う。,needs_review,,
news,https://shueisha.online/articles/-/194300,歌舞伎町で大手チェーン利用客を狙う案内手口の詳細報道,2026-05-28,新宿・歌舞伎町,非公開確認候補,,,,客引き経由の来店・席料等の説明確認,客引き経由の来店報告あり;席料・サービス料の説明不足報告あり;料金説明と会計内容の不一致報告あり,Hidden,報道では、既存チェーン利用客への案内、席料やサービス料などの名目、会計時の確認点が紹介されています。,証拠シグナル: 報道写真あり、会計名目の記述あり。記事中の画像、店名、個人名は公開列へ入れない。,needs_review,,
news,https://www.asahi.com/articles/ASRDM42NCRDMUTIL00K.html,歌舞伎町ホストクラブ等の料金表示義務に関する報道,2026-05-28,新宿・歌舞伎町,エリア単位の確認候補,,,,料金表示・メニュー確認,料金説明と会計内容の不一致報告あり;確認中,Hidden,報道では、警視庁の立入結果として、料金表示や従業員名簿に関する確認事項が紹介されています。,証拠シグナル: 警視庁立入結果を扱う報道。個別店舗名一覧として扱わず、エリア単位の確認項目へ抽象化する。,needs_review,,
municipality,https://www.city.shinjuku.lg.jp/whatsnew/pub/2023/1117-01.html,新宿区のホストクラブ等高額請求被害対策ページ,2026-05-28,新宿・歌舞伎町,エリア単位の確認候補,,,,公的な高額請求被害対策,高額請求トラブル報告あり;確認中,Hidden,新宿区が、歌舞伎町地区での高額請求被害対策と関係機関との連携方針を案内している公式ページです。,証拠シグナル: 自治体公式ページ。個別店舗への断定に使わず、相談導線と背景情報として扱う。,needs_review,,
news,https://news.livedoor.com/article/detail/28769638/,渋谷・道玄坂でマッチングアプリ経由の高額請求疑いに関する報道,2026-05-28,渋谷・道玄坂・宇田川町,非公開確認候補,,,,マッチングアプリ経由の来店・支払い前後の説明確認,料金説明と会計内容の不一致報告あり;会計時対応に関する注意報告あり;高額請求トラブル報告あり,Hidden,報道では、マッチングアプリ経由で飲食店へ誘導され、支払い前後の説明に関するトラブルが紹介されています。,証拠シグナル: 金額、誘導経路、支払い困難時の説明に関する報道。個人名や店舗名は公開列へ入れない。,needs_review,,
news,https://www.chiba-tv.com/plus/detail/202505224897,渋谷区のバーで高額な支払い要求に関する共同通信配信記事,2026-05-28,渋谷・道玄坂・宇田川町,非公開確認候補,,,,飲み放題条件・支払い前の金額確認,料金説明と会計内容の不一致報告あり;会計時対応に関する注意報告あり;高額請求トラブル報告あり,Hidden,共同通信配信記事では、渋谷区のバーで高額な支払い要求に関する事案が紹介されています。,証拠シグナル: 共同通信配信、金額、飲み放題条件の確認対象。短報のため追加出典と現在状況を確認する。,needs_review,,
municipality,https://www.city.shibuya.tokyo.jp/bosai/bohan/bohan-torikumi/kyakuhikikouhyou.html,渋谷区の客引き行為等に関する行政処分公表ページ,2026-05-28,渋谷・道玄坂・宇田川町,エリア単位の確認候補,,,,客引き行為等の行政処分・立入調査,客引き経由の来店報告あり;確認中,Hidden,渋谷区が、条例に基づく行政処分、規制区域、店舗等への立入調査件数を公表している公式ページです。,証拠シグナル: 自治体公式ページ。個人名、住所、詳細時刻は本サービスへ転載しない。,needs_review,,
news,https://getnews.jp/archives/2791173,池袋の飲食店で明細内容に関する利用者投稿を扱った記事,2026-05-28,池袋,非公開確認候補,,,,客引き経由の来店・明細内容確認,客引き経由の来店報告あり;明細提示に関するトラブル報告あり;会計時対応に関する注意報告あり,Hidden,記事では、客引き経由の案内、説明された条件、会計時の明細内容に関する利用者投稿が紹介されています。,証拠シグナル: レシート言及、動画言及、外部投稿由来。追加出典と現在状況が確認できるまで個別公開しない。,needs_review,,
news,https://gogotsu.com/archives/41472,池袋の飲食店で請求内訳が紹介された記事,2026-05-28,池袋,非公開確認候補,,,,席料等の説明確認・請求内訳確認,席料・サービス料の説明不足報告あり;料金説明と会計内容の不一致報告あり;高額請求トラブル報告あり,Hidden,記事では、西池袋周辺の飲食店について、料理点数、請求総額、席料等の内訳が紹介されています。,証拠シグナル: 請求内訳の記述、店名変更可能性への言及。住所、建物、階数を優先して確認する。,needs_review,,
news,https://nikkan-spa.jp/1540583,上野周辺の客引き取締り状況に関する取材記事,2026-05-28,上野・御徒町・湯島,エリア単位の確認候補,,,,客引き取締り・地域背景,客引き経由の来店報告あり;確認中,Hidden,取材記事では、上野周辺の客引き取締り、地域事情、警察対応の背景が紹介されています。,証拠シグナル: 現地取材記事。個別店舗報告ではなく、公式ソースと照合してエリア背景へ抽象化する。,needs_review,,
news,https://nlab.itmedia.co.jp/cont/articles/3253023/,国民生活センターの飲食店高額請求トラブル注意喚起を扱った記事,2026-05-28,都内共通,エリア単位の確認候補,,,,入店前確認・カード会社相談・消費生活相談,客引き経由の来店報告あり;高額請求トラブル報告あり;確認中,Hidden,記事では、国民生活センターの注意喚起として、客引き経由の来店、支払い、カード利用に関する相談事例が紹介されています。,証拠シグナル: 消費生活系注意喚起を扱う記事。元資料が再確認できるまで一般的な確認項目として扱う。,needs_review,,`;

function csvEscape(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function toCsv(rows: Record<string, string>[]) {
  return [
    INITIAL_DATA_COLUMNS.join(","),
    ...rows.map((row) =>
      INITIAL_DATA_COLUMNS.map((column) => csvEscape(row[column] ?? "")).join(","),
    ),
  ].join("\n");
}

function getMediaEvidenceRows() {
  return parseCsv(MEDIA_EVIDENCE_CANDIDATES_CSV).rows;
}

export function getMediaEvidenceCandidateCsv() {
  return toCsv(
    getMediaEvidenceRows().filter((row) => STAGEABLE_AREAS.has(row.observed_area)),
  );
}

export function getMediaEvidenceCandidateMetrics() {
  const rows = getMediaEvidenceRows();
  const stageableRows = rows.filter((row) => STAGEABLE_AREAS.has(row.observed_area));
  const areas = new Set(stageableRows.map((row) => row.observed_area).filter(Boolean));

  return {
    total: rows.length,
    stageable: stageableRows.length,
    deferredCommon: rows.length - stageableRows.length,
    areas: areas.size,
    newsSources: rows.filter((row) => row.source_type === "news").length,
    hiddenEvidence: rows.filter((row) => row.evidence_level === "Hidden").length,
  };
}
