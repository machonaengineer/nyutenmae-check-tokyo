# Source Link Check Log 2026-07-05

## 実行コマンド

```bash
npm run check:sources -- --max=39
```

## 結果

- 対象URL: 39件
- 到達確認OK: 38件
- review: 1件

## review対象

- `https://news.tv-asahi.co.jp/news_society/articles/000246210.html`
  - 2026-07-05時点のHTTP確認では404。
  - 報道本文、画像、スクリーンショットは転載しない。
  - 追加出典、現在状況、住所、建物名、階数が確認できるまで個別公開しない。

## 反映方針

- 公式・公的ソースの高優先度URLは、到達確認済みとして `SOURCE_RESEARCH_QUEUE.csv` の `research_status=source_verified` に更新した。
- 報道由来候補は、到達確認できても個別公開には進めない。`imported_needs_review` または `link_review` のまま、非公開審査と追加確認に回す。
- 公開ページには、本文転載ではなく出典URL、確認日、独自要約、次の確認事項だけを扱う。
