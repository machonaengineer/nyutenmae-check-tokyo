import "server-only";
import { parseCsv } from "@/lib/initial-data-validation";

export const INITIAL_DATA_CANDIDATE_CSV = `source_type,source_url,source_title,source_checked_at,observed_area,place_name,address,building_name,floor,incident_type,risk_tags,evidence_level,public_summary,private_memo,status,reviewed_by_admin,published_at
news,https://www.tokyo-sports.co.jp/articles/-/290541?page=1,2024年1月の歌舞伎町・系列店を装う客引き事案報道,2026-05-27,新宿・歌舞伎町,とりみち（報道上の表記）,東京都新宿区歌舞伎町,,,客引き経由の来店・料金説明,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり;席料・サービス料の説明不足報告あり;高額請求トラブル報告あり;確認中,Hidden,報道では、既存チェーンの関係者を装う客引きにより別店舗へ案内された事案が紹介されています。投稿者の申告に基づく情報ではなく、出典確認中の初期データ候補です。,東京スポーツ報道で店名表記を確認。住所・営業実態・現在状況は未確認。公開前に一次資料・複数報道・異議申立て導線を確認する。,needs_review,,
news,https://mezamashi.media/articles/-/20624,2024年1月の歌舞伎町・系列店案内に関する報道,2026-05-27,新宿・歌舞伎町,歌舞伎町の系列店案内先（報道上、店名要確認）,東京都新宿区歌舞伎町,,,客引き経由の来店・会計確認,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり;明細提示に関するトラブル報告あり;会計時対応に関する注意報告あり;高額請求トラブル報告あり;確認中,Hidden,報道では、系列店案内を受けた来店後に会計時の金額差異を確認したとの利用者証言が紹介されています。店名と住所は確認中のため、公開前審査が必要です。,めざましmedia報道を確認。本文転載は禁止。店名・住所・現在状況を確認できるまで公開承認しない。,needs_review,,
news,https://news.tv-asahi.co.jp/news_society/articles/000246210.html,2022年2月の池袋・客引き経由来店に関する報道,2026-05-27,池袋,西池袋のキャバクラ店（報道上、店名未確認）,東京都豊島区西池袋,,,客引き経由の来店・会計確認,客引き経由の来店報告あり;料金説明と会計内容の不一致報告あり;会計時対応に関する注意報告あり;高額請求トラブル報告あり;確認中,Hidden,報道では、豊島区西池袋の店舗について、客引き経由の来店と追加支払いに関する事案が紹介されています。店名は出典上確認できないため公開前審査が必要です。,テレビ朝日報道を確認。店名未確認のため、地図公開や個別店舗承認は追加確認まで不可。,needs_review,,
news,https://s.mxtv.jp/mxnews/article/chiiki/1etqjlg0fa1utasu2.html,2023年11月の歌舞伎町ホストクラブ利用に関する報道,2026-05-27,新宿・歌舞伎町,ARCANA（報道上の表記）,東京都新宿区歌舞伎町,,,料金説明・会計確認,高額請求トラブル報告あり;会計時対応に関する注意報告あり;確認中,Hidden,報道では、同名店舗の利用に関連し、高額な支払いに関する相談文脈が紹介されています。法令違反疑いの報道も含むため、公開前に現在状況と表現確認が必要です。,TOKYO MX報道を確認。高額支払い文脈と別の法令違反疑いが混在するため、当サービス対象範囲に絞った要約へ審査時に再編集する。,needs_review,,
news,https://www.asahi.com/articles/ASR5K76S8R5KUTIL007.html,2023年5月の歌舞伎町1丁目・飲み放題条件と会計対応に関する報道,2026-05-27,新宿・歌舞伎町,歌舞伎町1丁目のバー（報道上、店名未確認）,東京都新宿区歌舞伎町1丁目,,,飲み放題条件・会計時対応,料金説明と会計内容の不一致報告あり;飲み放題条件の不一致報告あり;会計時対応に関する注意報告あり;退店時対応に関する注意報告あり;高額請求トラブル報告あり;確認中,Hidden,報道では、飲み放題条件や会計時対応に関して利用者側との認識差があった事案が紹介されています。店名未確認のため、公開前に出典確認と人間審査が必要です。,朝日新聞報道を確認。店名未確認。詳細な事件記述や個人情報は公開要約に入れない。,needs_review,,`;

export const INITIAL_DATA_REVIEW_QUEUE_CSV = `candidate_file,row_number,review_priority,source_url,observed_area,place_name,address_precision,building_name_status,floor_status,source_verified,public_summary_checked,legal_review_status,recommended_status,next_action
INITIAL_DATA_CANDIDATES_2026-05-27.csv,2,high,https://www.tokyo-sports.co.jp/articles/-/290541?page=1,新宿・歌舞伎町,報道上の店名表記あり,町域まで,未確認,未確認,no,no,not_started,needs_review,出典URLと現在状況を確認し、住所・建物名が確認できるまで公開承認しない
INITIAL_DATA_CANDIDATES_2026-05-27.csv,3,high,https://mezamashi.media/articles/-/20624,新宿・歌舞伎町,店名要確認,町域まで,未確認,未確認,no,no,not_started,needs_review,個別店舗公開ではなくエリア注意喚起に回すか、追加出典を確認する
INITIAL_DATA_CANDIDATES_2026-05-27.csv,4,high,https://news.tv-asahi.co.jp/news_society/articles/000246210.html,池袋,店名未確認,町域まで,未確認,未確認,no,no,not_started,needs_review,店名未確認のため追加出典が得られるまで個別公開しない
INITIAL_DATA_CANDIDATES_2026-05-27.csv,5,medium,https://s.mxtv.jp/mxnews/article/chiiki/1etqjlg0fa1utasu2.html,新宿・歌舞伎町,報道上の店名表記あり,町域まで,未確認,未確認,no,no,not_started,needs_review,当サービス対象外の論点を混ぜず料金説明・会計確認の範囲に限定できるか確認する
INITIAL_DATA_CANDIDATES_2026-05-27.csv,6,medium,https://www.asahi.com/articles/ASR5K76S8R5KUTIL007.html,新宿・歌舞伎町,店名未確認,町域まで,未確認,未確認,no,no,not_started,needs_review,店名未確認のため個別店舗公開ではなく確認項目と相談導線の改善材料として扱う`;

export type InitialDataReviewQueueItem = {
  candidateFile: string;
  rowNumber: string;
  reviewPriority: string;
  sourceUrl: string;
  observedArea: string;
  placeName: string;
  addressPrecision: string;
  buildingNameStatus: string;
  floorStatus: string;
  sourceVerified: string;
  publicSummaryChecked: string;
  legalReviewStatus: string;
  recommendedStatus: string;
  nextAction: string;
};

export function getInitialDataReviewQueue(): InitialDataReviewQueueItem[] {
  const { rows } = parseCsv(INITIAL_DATA_REVIEW_QUEUE_CSV);

  return rows.map((row) => ({
    candidateFile: row.candidate_file ?? "",
    rowNumber: row.row_number ?? "",
    reviewPriority: row.review_priority ?? "",
    sourceUrl: row.source_url ?? "",
    observedArea: row.observed_area ?? "",
    placeName: row.place_name ?? "",
    addressPrecision: row.address_precision ?? "",
    buildingNameStatus: row.building_name_status ?? "",
    floorStatus: row.floor_status ?? "",
    sourceVerified: row.source_verified ?? "",
    publicSummaryChecked: row.public_summary_checked ?? "",
    legalReviewStatus: row.legal_review_status ?? "",
    recommendedStatus: row.recommended_status ?? "",
    nextAction: row.next_action ?? "",
  }));
}

export function getInitialDataReviewMetrics() {
  const queue = getInitialDataReviewQueue();

  return {
    total: queue.length,
    highPriority: queue.filter((item) => item.reviewPriority === "high").length,
    sourceUnverified: queue.filter((item) => item.sourceVerified !== "yes").length,
    legalNotStarted: queue.filter((item) => item.legalReviewStatus !== "done").length,
    needsReview: queue.filter((item) => item.recommendedStatus === "needs_review").length,
  };
}
