import Link from "next/link";
import {
  DefinitionList,
  PolicyNote,
  Section,
  SimpleList,
} from "@/components/page-blocks";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/site-shell";
import {
  EVIDENCE_LEVELS,
  INITIAL_AREAS,
  PUBLICATION_RULES,
  REPORT_CATEGORIES,
  SITE,
  TONE_GUIDELINES,
} from "@/lib/site";
import { SocialShareActions } from "@/components/social-share-actions";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { getHomeFaqStructuredData } from "@/lib/structured-data";

const servicePrinciples = [
  {
    title: "星評価は使いません",
    text: "味や通常接客ではなく、料金説明、会計確認、明細提示、退店時対応に関わる報告を扱います。",
  },
  {
    title: "自動公開しません",
    text: "投稿は管理者が表現、個人情報、証拠レベルを確認してから公開判断します。",
  },
  {
    title: "証拠は分けて管理します",
    text: "証拠画像と投稿者メールアドレスは一般公開せず、管理確認用の情報として扱います。",
  },
] as const;

export default function Home() {
  return (
    <>
      <JsonLd data={getHomeFaqStructuredData()} />
      <section className="border-b border-line bg-white">
        <Container>
          <div className="grid gap-10 py-12 lg:grid-cols-[1fr_440px] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-action">都内繁華街の入店前確認</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                {SITE.name}
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-9 text-muted">
                {SITE.description}
              </p>
              <div className="mt-6 grid max-w-2xl gap-3 text-sm leading-6 text-muted sm:grid-cols-3">
                <div className="border-l-2 border-action pl-3">
                  承認済み投稿のみ公開
                </div>
                <div className="border-l-2 border-action pl-3">
                  証拠画像は非公開
                </div>
                <div className="border-l-2 border-action pl-3">
                  星評価は使わない
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/map"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-action-dark"
                >
                  地図を見る
                </Link>
                <Link
                  href="/reports/new"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                >
                  注意報告を送る
                </Link>
                <Link
                  href="/contribute"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                >
                  情報提供の方針を見る
                </Link>
              </div>
            </div>
            <div className="rounded-md border border-line bg-white p-4 shadow-[0_18px_42px_rgb(23_32_42/0.08)]">
              <div className="border-b border-line pb-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted">
                  PUBLIC CAUTION MAP
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  初期対象エリア
                </p>
              </div>
              <div className="relative mt-4 min-h-[280px] overflow-hidden rounded-md border border-action/20 bg-map-light">
                <div className="absolute left-0 top-[48%] h-2 w-full -rotate-6 bg-white/85" />
                <div className="absolute left-[34%] top-0 h-full w-2 rotate-12 bg-white/80" />
                <div className="absolute bottom-10 left-0 h-2 w-full rotate-3 bg-white/85" />
                <div className="absolute left-[68%] top-0 h-full w-2 -rotate-12 bg-white/70" />
                {INITIAL_AREAS.map((area, index) => (
                  <div
                    key={area.name}
                    className="absolute rounded-md border border-action/25 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-[0_8px_18px_rgb(23_32_42/0.08)]"
                    style={{
                      left: `${12 + (index % 2) * 46}%`,
                      top: `${18 + index * 17}%`,
                    }}
                  >
                    {area.name}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-6 text-muted">
                地図上に表示する情報は、承認済みの注意報告に限定する設計です。
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Section
        title="このサービスで扱う情報"
        description="投稿者の申告に基づく注意情報として、入店前に確認しやすい形式へ整理します。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {servicePrinciples.map((principle) => (
            <article key={principle.title} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <h2 className="text-lg font-bold text-ink">{principle.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{principle.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="初期対象エリア">
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <article key={area.name} className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-sm font-semibold text-action">{area.center}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">{area.name}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{area.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <Link className="text-action no-underline" href={`/areas/${area.slug}`}>
                  公開情報を見る
                </Link>
                <Link className="text-action no-underline" href={`/areas/${area.slug}/checklist`}>
                  確認リストを見る
                </Link>
                <Link
                  className="text-action no-underline"
                  href={`/areas/${area.slug}/topics/price-confirmation`}
                >
                  料金確認を見る
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="入店前チェックリスト"
        description="入店前、会計前、退店後に確認したい項目を、公開ページとして整理しています。"
      >
        <Link
          href="/checklists"
          className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
        >
          確認リストを見る
        </Link>
      </Section>

      <Section title="報告カテゴリ">
        <SimpleList items={REPORT_CATEGORIES} />
      </Section>

      <Section
        title="情報提供を募集しています"
        description="公開情報が少ない初期段階のため、具体的な経緯、明細の有無、相談状況などの情報提供を受け付けています。"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contribute"
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
          >
            情報提供の方針を見る
          </Link>
          <Link
            href="/reports/new"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            注意報告を送る
          </Link>
          <Link
            href="/sources"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            公式情報ソースを見る
          </Link>
        </div>
      </Section>

      <Section
        title="SNSで共有する"
        description="断定や転載を避けた形で、入店前確認の導線を共有できます。"
      >
        <SocialShareActions title={SITE.name} url={getAbsoluteSiteUrl("/")} />
      </Section>

      <Section title="公開と表現の方針">
        <div className="grid gap-6 lg:grid-cols-2">
          <SimpleList items={PUBLICATION_RULES} />
          <SimpleList items={TONE_GUIDELINES} />
        </div>
        <div className="mt-6">
          <PolicyNote>
            掲載内容は店舗や個人への評価ではなく、投稿者の申告に基づく注意情報です。公開時は断定を避け、確認状況と証拠レベルを分けて表示します。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="証拠レベル"
        description="次工程のDB実装では、公開本文と非公開証拠を分離して管理します。"
      >
        <DefinitionList items={EVIDENCE_LEVELS} />
      </Section>
    </>
  );
}
