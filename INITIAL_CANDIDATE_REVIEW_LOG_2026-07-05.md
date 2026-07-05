# Initial Candidate Review Log 2026-07-05

## Purpose

12か月KGIのうち、承認済み公開情報150件と月間100件の有効情報提供に向けて、高優先度の初期データ候補を審査可能な状態へ進める。

## Reviewed Items

| candidate_file | row_number | priority | area | result |
| --- | --- | --- | --- | --- |
| private-candidates.csv | 2 | high | 新宿・歌舞伎町 | blocked_missing_source |
| private-candidates.csv | 3 | high | 池袋 | blocked_missing_source |

## Decision

`private-candidates.csv` の実ファイルがリポジトリ内に存在せず、候補2件はいずれも `source_url` が空欄だったため、出典確認済みにはしない。店名、住所、建物名、階数、現在状況、出典URL、確認日がそろうまで `source_verified=no` と `recommended_status=needs_review` を維持する。

## Safety Notes

- 具体出典がない候補を承認済み公開情報へ変換しない。
- 同一住所、同一建物、同一運営、同一店舗であることを断定しない。
- 外部口コミ、SNS、ブログ、ニュース本文を転載しない。
- 投稿者メール、証拠画像URL、storage_path、private_noteを公開候補に含めない。

## Required Before Re-review

1. `source_url`
2. `source_title`
3. `source_checked_at`
4. `place_name` または公開可能な住所単位
5. `address`、`building_name`、`floor` の確認状況
6. 独自要約の `public_summary`
7. 管理者だけが見る `private_memo`
