# AdSense導入ガイド

このガイドは、AdSenseを将来有効化するための実装・運用メモです。2026-05-27時点では、広告表示は環境変数でOFFを初期値にします。

## 基本方針

- AdSenseアカウントのログイン情報、本人確認情報、支払い情報はリポジトリやチャットに残さない。
- AdSenseのpublisher ID、client ID、ad slot IDはVercel環境変数で管理する。
- 広告は投稿審査、公開順位、リスクタグ、証拠レベル、異議申立て対応に影響させない。
- 広告枠には、投稿者メールアドレス、非公開メモ、証拠画像、Storage path、外部口コミ本文を含めない。
- まずは `/checklists` と `/areas/[slug]/checklist` の情報整理ページだけを対象にする。
- 管理画面、投稿フォーム、異議申立てフォーム、証拠画像確認画面には広告を出さない。

## 必要な環境変数

```bash
NEXT_PUBLIC_MONETIZATION_ENABLED=false
NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=false
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_CHECKLIST=
NEXT_PUBLIC_ADSENSE_SLOT_AREA=
NEXT_PUBLIC_ADSENSE_SLOT_SUPPORT=
ADS_TXT_GOOGLE_PUBLISHER_ID=
```

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_MONETIZATION_ENABLED` | 収益化枠全体の表示スイッチ |
| `NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED` | AdSenseの所有権確認コードだけを読み込む審査用スイッチ |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | AdSense広告ユニットの表示スイッチ。審査通過前は `false` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-0000000000000000` 形式のAdSense client ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_CHECKLIST` | `/checklists` 用ad slot ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_AREA` | `/areas/[slug]/checklist` 用ad slot ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_SUPPORT` | 将来の支援ページ用ad slot ID。初期運用では未使用でもよい |
| `ADS_TXT_GOOGLE_PUBLISHER_ID` | `/ads.txt` で返す `pub-0000000000000000` 形式のpublisher ID |

## 有効化手順

1. AdSense側でサイトを追加し、所有権確認や審査に必要な作業を行う。
2. Vercelに `ADS_TXT_GOOGLE_PUBLISHER_ID` を設定し、再デプロイする。
3. `https://nyutenmae-check-tokyo.vercel.app/ads.txt` が `google.com, pub-..., DIRECT, f08c47fec0942fa0` を返すことを確認する。
4. AdSense管理画面でads.txtの再確認を実行する。
5. 所有権確認が必要な場合だけ `NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=true` と `NEXT_PUBLIC_ADSENSE_CLIENT` を設定し、ad slot IDは未設定のまま再デプロイする。
6. AdSense審査が通るまで `NEXT_PUBLIC_MONETIZATION_ENABLED=false` と `NEXT_PUBLIC_ADSENSE_ENABLED=false` を維持する。
7. 審査通過後、ad slot IDをVercelに設定する。
8. Preview環境で広告枠の表示位置、誤クリック誘導がないこと、プライバシーポリシー表示を確認する。
9. 本番環境で `NEXT_PUBLIC_MONETIZATION_ENABLED=true`、`NEXT_PUBLIC_ADSENSE_ENABLED=true` に変更し、再デプロイする。

## ポリシーチェック

- 広告クリックを促す文言を置かない。
- 広告枠の見出しは「広告」に限定し、コンテンツやナビゲーションと誤認させない。
- 投稿フォームや管理画面など、非公開情報を扱うページに広告タグを置かない。
- プライバシーポリシーでAdSense等の広告Cookie、外部広告事業者、オプトアウトに関する案内を確認する。
- 無効なクリック、自己クリック、クリック依頼、クリック報酬を禁止する。

## 申請前コンテンツ確認

- `/`, `/map`, `/areas`, `/checklists`, `/topics`, `/sources`, `/support`, `/guidelines`, `/terms`, `/privacy`, `/monetization-policy` が404ではなく、独自の説明文を持っている。
- `/sources` の報道・公的情報は、出典URL、確認日、独自要約として扱い、記事本文、口コミ本文、画像、スクリーンショットを転載していない。
- 公開ページに投稿者メールアドレス、非公開メモ、証拠画像URL、Storage pathが含まれていない。
- 収益化枠は管理画面、投稿フォーム、異議申立てフォーム、証拠画像確認画面には表示しない。
- AdSenseサイト審査が `Ready` になるまで、`NEXT_PUBLIC_ADSENSE_ENABLED=false` を維持する。所有権確認コードだけが必要な場合は `NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=true` を使う。
- ads.txtはルートの `/ads.txt` でHTTP 200を返し、robots.txtでブロックしない。

## 公式確認先

- AdSense Program policies: https://support.google.com/adsense/answer/48182
- Ad placement policies: https://support.google.com/adsense/answer/1346295
- How AdSense uses cookies: https://support.google.com/adsense/answer/7549925
- Ads.txt guide: https://support.google.com/adsense/answer/12171612
- Invalid traffic: https://support.google.com/adsense/answer/16737
