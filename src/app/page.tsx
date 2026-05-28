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
import { TrackedLink } from "@/components/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { RESEARCH_SOURCES } from "@/lib/research-sources";
import { getHomeFaqStructuredData } from "@/lib/structured-data";

const homeMetrics = [
  {
    label: "掲載対象エリア",
    value: `${INITIAL_AREAS.length}`,
    note: "都内主要繁華街へ拡大中",
  },
  {
    label: "公式確認先",
    value: `${RESEARCH_SOURCES.length}`,
    note: "自治体、警察、消費生活相談",
  },
  {
    label: "情報提供",
    value: "非公開受付",
    note: "管理者確認後に掲載",
  },
] as const;

const servicePrinciples = [
  {
    title: "料金条件を確認しやすく",
    text: "入店前の説明、会計時の金額、明細の有無を分けて整理します。",
  },
  {
    title: "場所の手がかりで探せます",
    text: "店名が変わる場合も、住所、建物名、階数から確認できます。",
  },
  {
    title: "相談先につなげます",
    text: "困った時に確認したい公的窓口やカード会社への相談導線をまとめます。",
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
                  料金条件を確認
                </div>
                <div className="border-l-2 border-action pl-3">
                  明細・領収書を記録
                </div>
                <div className="border-l-2 border-action pl-3">
                  相談先も確認
                </div>
              </div>
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {homeMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-md border border-line bg-surface px-4 py-3 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
                  >
                    <p className="text-xs font-semibold text-muted">{metric.label}</p>
                    <p className="mt-2 text-2xl font-bold text-ink">{metric.value}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{metric.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href="/map"
                  eventName={ANALYTICS_EVENTS.guideCta}
                  eventProperties={{ placement: "home", target: "map" }}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-action-dark"
                >
                  地図を見る
                </TrackedLink>
                <TrackedLink
                  href="/reports/quick"
                  eventName={ANALYTICS_EVENTS.quickReportCta}
                  eventProperties={{ placement: "home" }}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                >
                  30秒で情報提供
                </TrackedLink>
                <Link
                  href="/guides"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                >
                  実用ガイドを見る
                </Link>
              </div>
            </div>
            <div className="rounded-md border border-line bg-white p-4 shadow-[0_18px_42px_rgb(23_32_42/0.08)]">
              <div className="border-b border-line pb-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted">
                  PUBLIC CAUTION MAP
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  掲載対象エリア
                </p>
              </div>
              <div className="relative mt-4 min-h-[280px] overflow-hidden rounded-md border border-action/20 bg-map-light">
                <div className="absolute left-0 top-[48%] h-2 w-full -rotate-6 bg-white/85" />
                <div className="absolute left-[34%] top-0 h-full w-2 rotate-12 bg-white/80" />
                <div className="absolute bottom-10 left-0 h-2 w-full rotate-3 bg-white/85" />
                <div className="absolute left-[68%] top-0 h-full w-2 -rotate-12 bg-white/70" />
                {INITIAL_AREAS.map((area, index) => {
                  const x = 8 + (index % 3) * 30;
                  const y = 12 + Math.floor(index / 3) * 20;

                  return (
                  <div
                    key={area.name}
                    className="absolute rounded-md border border-action/25 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-[0_8px_18px_rgb(23_32_42/0.08)]"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                    }}
                  >
                    {area.name}
                  </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-muted">
                エリアごとの確認先と、公開できる報告の位置を地図で確認できます。
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Section
        title="このサービスでできること"
        description="料金条件、明細、相談先を入店前後に確認しやすく整理します。"
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

      <Section title="掲載対象エリア">
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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/checklists"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            確認リストを見る
          </Link>
          <Link
            href="/guides"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            実用ガイドを見る
          </Link>
        </div>
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
          <TrackedLink
            href="/reports/quick"
            eventName={ANALYTICS_EVENTS.quickReportCta}
            eventProperties={{ placement: "home_information_request" }}
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          >
            30秒で情報提供
          </TrackedLink>
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
        description="確認リストや相談先を、必要な人に共有できます。"
      >
        <SocialShareActions title={SITE.name} url={getAbsoluteSiteUrl("/")} />
      </Section>

      <Section title="掲載方針">
        <div className="grid gap-6 lg:grid-cols-2">
          <SimpleList items={PUBLICATION_RULES} />
          <SimpleList items={TONE_GUIDELINES} />
        </div>
        <div className="mt-6">
          <PolicyNote>
            詳しい審査基準、公開しない情報、異議申立ての流れは掲載方針ページにまとめています。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="確認レベル"
        description="公開時は、確認状況を分けて表示します。"
      >
        <DefinitionList items={EVIDENCE_LEVELS} />
      </Section>
    </>
  );
}
