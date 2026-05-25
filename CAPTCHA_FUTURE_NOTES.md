# CAPTCHA導入メモ

本番MVPでは、外部captchaを導入せず、DBベースの簡易rate limit、ブラウザ識別Cookie、honeypotで最低限の連投対策を行います。スパムが増えた場合は、Cloudflare TurnstileまたはhCaptchaを追加してください。

## 導入候補

- Cloudflare Turnstile
- hCaptcha

## 設計方針

1. site keyは `NEXT_PUBLIC_` 付きの公開環境変数でブラウザへ渡す。
2. secret keyは `TURNSTILE_SECRET_KEY` または `HCAPTCHA_SECRET_KEY` としてサーバーだけに置く。
3. 投稿フォームと異議申立てフォームのServer Actionで、保存前にcaptcha tokenを検証する。
4. captcha検証に失敗した場合、DB保存、Storage upload、rate limit更新を行わない。
5. Service Role Keyとは別のsecretとして管理し、ブラウザへ出さない。

## 想定環境変数

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
```

## 実装位置

- 投稿フォーム: `src/app/reports/new/report-form.tsx`
- 投稿Server Action: `src/app/reports/new/actions.ts`
- 異議申立てフォーム: `src/app/objection/objection-form.tsx`
- 異議申立てServer Action: `src/app/objection/actions.ts`
- 共通検証ヘルパー候補: `src/lib/captcha-verification.ts`

## 注意点

- captchaはrate limitの代替ではなく、併用する。
- 管理画面にはcaptchaを入れず、Supabase Authと `ADMIN_EMAILS` で制御する。
- トークン検証は必ずサーバー側で行う。
