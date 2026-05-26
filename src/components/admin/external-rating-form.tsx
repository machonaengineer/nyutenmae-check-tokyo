import {
  addExternalRatingSnapshotAction,
  syncGoogleExternalRatingAction,
} from "@/app/admin/actions";
import type {
  AdminExternalRatingSnapshot,
  AdminExternalReviewSource,
} from "@/lib/admin/data";
import {
  EXTERNAL_COLLECTION_METHODS,
  formatExternalRating,
  formatRatingCount,
  getExternalCollectionMethodLabel,
} from "@/lib/external-ratings";
import { formatDate } from "@/lib/format";

export function ExternalRatingPanel({
  placeId,
  reportId,
  sources,
  snapshots,
}: {
  placeId: string;
  reportId: string;
  sources: AdminExternalReviewSource[];
  snapshots: AdminExternalRatingSnapshot[];
}) {
  const checkedAtValue = new Date().toISOString().slice(0, 16);
  const googleSource = sources.find((source) => source.slug === "google_maps");

  return (
    <div className="rounded-md border border-line bg-white p-5 shadow-[0_10px_28px_rgb(23_32_42/0.05)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">外部評価参考値</h2>
          <p className="mt-2 text-xs leading-5 text-muted">
            口コミ本文は保存せず、集計値、出典URL、確認日だけを扱います。
          </p>
        </div>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
          評価軸は別
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {snapshots.length > 0 ? (
          snapshots.map((snapshot) => (
            <div key={snapshot.id} className="rounded-md border border-line bg-paper p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">{snapshot.sourceLabel}</p>
                <span
                  className={
                    snapshot.displayAllowed
                      ? "rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800"
                      : "rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                  }
                >
                  {snapshot.displayAllowed ? "公開候補" : "非公開"}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 text-xs leading-5 text-muted">
                <div>
                  <dt className="font-semibold text-ink">評価</dt>
                  <dd>
                    {formatExternalRating(snapshot.ratingValue, snapshot.ratingScale)} /{" "}
                    {formatRatingCount(snapshot.ratingCount)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">確認日</dt>
                  <dd>{formatDate(snapshot.checkedAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">取得方法</dt>
                  <dd>{getExternalCollectionMethodLabel(snapshot.collectionMethod)}</dd>
                </div>
              </dl>
              {snapshot.sourceUrl ? (
                <a
                  className="mt-3 inline-flex break-all text-xs font-semibold text-action"
                  href={snapshot.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  出典を開く
                </a>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-line bg-paper p-4 text-sm leading-6 text-muted">
            外部評価スナップショットはまだありません。
          </div>
        )}
      </div>

      {sources.length > 0 ? (
        <form action={addExternalRatingSnapshotAction} className="mt-5 grid gap-4 border-t border-line pt-5">
          <input name="report_id" type="hidden" value={reportId} />
          <input name="place_id" type="hidden" value={placeId} />

          <label className="grid gap-2 text-sm font-semibold text-ink">
            ソース
            <select
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
              name="source_id"
              required
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              外部Place ID
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                name="external_place_id"
                placeholder="Google Place IDなど"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              出典URL
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                name="source_url"
                placeholder="https://..."
                type="url"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            出典タイトル
            <input
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
              name="source_title"
              placeholder="Google マップ等"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              評価値
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                max="10"
                min="0"
                name="rating_value"
                step="0.01"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              評価スケール
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                defaultValue="5"
                max="10"
                min="1"
                name="rating_scale"
                step="0.1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              評価件数
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                min="0"
                name="rating_count"
                type="number"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              確認日時
              <input
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                defaultValue={checkedAtValue}
                name="checked_at"
                required
                type="datetime-local"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              取得方法
              <select
                className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
                name="collection_method"
              >
                {EXTERNAL_COLLECTION_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {getExternalCollectionMethodLabel(method)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            帰属表示
            <input
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
              name="attribution_label"
              placeholder="Google等"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            公開注記
            <textarea
              className="min-h-20 rounded-md border border-line bg-white px-3 py-2 text-sm font-normal leading-6 text-ink"
              maxLength={240}
              name="public_note"
              placeholder="外部評価と本サービスの注意報告は評価軸が異なります。"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            非公開メモ
            <textarea
              className="min-h-20 rounded-md border border-line bg-white px-3 py-2 text-sm font-normal leading-6 text-ink"
              name="private_memo"
              placeholder="確認方法、許諾状況、注意点。口コミ本文は貼り付けない。"
            />
          </label>

          <label className="flex items-start gap-3 rounded-md border border-line bg-paper px-3 py-3 text-sm leading-6">
            <input className="mt-1" name="display_allowed" type="checkbox" />
            <span>
              公開ページへの表示を許可する
              <span className="block text-xs text-muted">
                出典URL、確認日、規約、帰属表示を確認した場合のみ有効にしてください。
              </span>
            </span>
          </label>

          <button className="h-10 rounded-md bg-action px-4 text-sm font-semibold text-white" type="submit">
            スナップショットを追加
          </button>
        </form>
      ) : (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          外部評価ソースが未作成です。`0007_external_rating_snapshots.sql` を適用してください。
        </p>
      )}

      {googleSource ? (
        <form action={syncGoogleExternalRatingAction} className="mt-5 grid gap-3 border-t border-line pt-5">
          <input name="report_id" type="hidden" value={reportId} />
          <input name="place_id" type="hidden" value={placeId} />
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Google Place ID
            <input
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink"
              name="google_place_id"
              placeholder="ChIJ..."
            />
          </label>
          <button className="h-10 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink" type="submit">
            Google公式APIから取得
          </button>
          <p className="text-xs leading-5 text-muted">
            `GOOGLE_PLACES_API_KEY` 設定時のみ動作します。API利用料とGoogleの表示ルールを確認してください。
          </p>
        </form>
      ) : null}
    </div>
  );
}
