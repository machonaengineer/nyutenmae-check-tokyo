import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { createPageMetadata } from "@/lib/seo";

const immediateActions = [
  "その場で身の危険を感じた場合は、支払い交渉より安全確保を優先してください。",
  "緊急時は110番に通報してください。",
  "緊急ではない警察への相談は、警察相談専用電話 #9110 も選択肢になります。",
  "契約や支払いに関する相談先が分からない場合は、消費者ホットライン 188 を確認してください。",
  "カード決済の場合は、クレジットカード会社へ相談し、利用控えや請求明細を保存してください。",
] as const;

const evidenceItems = [
  "レシート、明細、メニュー、料金表、注文履歴を保存する",
  "客引き時の説明内容、入店前に提示された条件、店内での説明を時系列でメモする",
  "日時、人数、同行者情報、支払い方法、請求金額を記録する",
  "Google Maps URL、建物名、階数など、場所を特定できる情報を残す",
  "身の安全を損なう撮影や録音は避ける",
] as const;

const serviceLimitations = [
  "本ページは相談先を整理するための案内であり、法律判断や個別交渉の代理ではありません。",
  "投稿内容は自動公開せず、証拠画像や連絡先は一般公開しません。",
  "入店前チェック東京への投稿と、公的機関やカード会社への相談は別の手続きです。",
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "相談先一覧｜入店前チェック東京",
  description:
    "緊急時の110番、警察相談専用電話#9110、消費者ホットライン188、カード会社、消費生活センターなど、料金説明や会計内容に不安がある時の相談先と記録項目を整理します。",
  path: "/support",
  imageLabel: "110・#9110・188・カード会社",
});

const officialSupportContacts = [
  {
    name: "緊急時の110番",
    tel: "110",
    use: "身の危険、事件や事故など緊急性がある場合",
    situation: "その場で安全確保が必要な場合",
    url: "https://www.npa.go.jp/",
    caution: "通話できる安全な場所へ移動し、現在地を伝えられるようにしてください。",
  },
  {
    name: "警察相談専用電話 #9110",
    tel: "#9110",
    use: "緊急ではないが警察に相談すべきか迷う場合",
    situation: "不安や危険を感じ、今後の対応を相談したい場合",
    url: "https://www.gov-online.go.jp/useful/article/201309/3.html",
    caution: "一部の電話ではつながらない場合があります。公式ページで案内を確認してください。",
  },
  {
    name: "消費者ホットライン 188",
    tel: "188",
    use: "契約、支払い、請求内容について消費生活相談につなげたい場合",
    situation: "会計内容や説明との差に不安があり、相談先を探したい場合",
    url: "https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/",
    caution: "受付時間や接続先は地域により異なるため、公式情報を確認してください。",
  },
  {
    name: "国民生活センター FAQ",
    tel: "公式ページを確認",
    use: "飲食店での高額な請求に関する一般的な相談情報を確認したい場合",
    situation: "公的機関のFAQで相談の考え方を確認したい場合",
    url: "https://www.faq.kokusen.go.jp/faq/show/528?site_domain=default",
    caution: "個別判断や返金可否を保証するものではありません。",
  },
  {
    name: "クレジットカード会社",
    tel: "カード裏面またはアプリを確認",
    use: "カード決済後の利用控え、請求明細、調査依頼について相談したい場合",
    situation: "決済額や加盟店表示に不安がある場合",
    url: "",
    caution: "カード番号、署名、承認番号を公開しないでください。",
  },
  {
    name: "東京都消費生活総合センター",
    tel: "公式ページを確認",
    use: "東京都内の消費生活相談窓口を確認したい場合",
    situation: "188とあわせて都内窓口の情報を確認したい場合",
    url: "https://www.shouhiseikatu.metro.tokyo.lg.jp/sodan/sodan.html",
    caution: "受付時間や対象地域は公式ページで確認してください。",
  },
] as const;

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="トラブル時の相談先"
        description="会計内容、明細提示、退店時対応などで不安がある場合に、相談先と保存しておきたい情報を確認できます。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section title="まず安全を優先する">
        <SimpleList items={immediateActions} />
        <div className="mt-6">
          <PolicyNote>
            その場で危険を感じる場合は、請求内容の確認や支払い交渉を続けるより、明るい場所への移動、同行者との合流、110番通報など安全確保を優先してください。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="相談先"
        description="番号や案内は変更される可能性があるため、公式ページも確認してください。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">緊急時</h2>
            <p className="mt-3 text-3xl font-bold text-action">110</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              事件や事故など、緊急性がある場合の通報先です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.npa.go.jp/goiken_index.html"
              rel="noreferrer"
              target="_blank"
            >
              警察庁の案内を確認
            </a>
          </article>

          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">警察への相談</h2>
            <p className="mt-3 text-3xl font-bold text-action">#9110</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              緊急ではない相談や、警察に相談すべきか迷う場合の相談専用電話です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.npa.go.jp/goiken_index.html"
              rel="noreferrer"
              target="_blank"
            >
              警察庁の案内を確認
            </a>
          </article>

          <article className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">消費生活相談</h2>
            <p className="mt-3 text-3xl font-bold text-action">188</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              契約や支払いに関する相談先が分からない場合、近くの相談窓口につながる案内です。
            </p>
            <a
              className="mt-4 inline-flex text-sm font-semibold text-action"
              href="https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/"
              rel="noreferrer"
              target="_blank"
            >
              消費者庁の案内を確認
            </a>
          </article>
        </div>
      </Section>

      <Section
        title="相談先一覧"
        description="用途、相談すべき状況、公式URL、保存しておきたい記録を分けて確認できます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {officialSupportContacts.map((contact) => (
            <article
              className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
              key={contact.name}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-ink">{contact.name}</h2>
                <span className="rounded-md border border-amber-200 bg-caution-soft px-2 py-1 text-xs font-semibold text-caution">
                  {contact.tel}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm leading-6 text-muted">
                <div>
                  <dt className="font-semibold text-ink">用途</dt>
                  <dd>{contact.use}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">相談すべき状況</dt>
                  <dd>{contact.situation}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">注意事項</dt>
                  <dd>{contact.caution}</dd>
                </div>
              </dl>
              {contact.url ? (
                <a
                  className="mt-4 inline-flex text-sm font-semibold text-action"
                  href={contact.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  公式ページを確認
                </a>
              ) : (
                <p className="mt-4 text-sm font-semibold text-muted">
                  公式ページまたはカード会社アプリを確認
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section title="保存しておきたい情報">
        <SimpleList items={evidenceItems} />
      </Section>

      <Section title="このサービスでできること">
        <SimpleList items={serviceLimitations} />
      </Section>
    </>
  );
}
