import type { Metadata } from "next";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { MONETIZATION_GUARDRAILS } from "@/lib/growth-content";

export const metadata: Metadata = {
  title: "収益化と掲載独立性",
  description:
    "入店前チェック東京における広告、スポンサー、支援リンクの扱いと掲載独立性の方針です。",
  alternates: {
    canonical: "/monetization-policy",
  },
};

const independenceRules = [
  "広告、スポンサー、支援リンクは、投稿審査、公開順位、リスクタグ、証拠レベルに影響しません。",
  "掲載内容への異議申立てや非公開化判断は、支援者や広告主よりも安全性、権利侵害リスク、証拠確認を優先します。",
  "収益化枠には、店舗や個人への断定表現、外部口コミ本文、証拠画像、投稿者メールアドレスを含めません。",
  "収益化を開始する場合は、利用規約、プライバシーポリシー、広告サービス規約、ホスティングプランを確認します。",
] as const;

export default function MonetizationPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transparency"
        title="収益化と掲載独立性"
        description="将来的に広告、スポンサー、支援リンクを扱う場合でも、注意報告の審査と公開判断を独立して行うための方針です。"
        primaryAction={{ href: "/terms", label: "利用規約を見る" }}
      />

      <Section title="基本方針">
        <SimpleList items={independenceRules} />
        <div className="mt-6">
          <PolicyNote>
            現時点では、収益化枠は環境変数でOFFにする設計です。実際に表示を開始する前に、人間による法務・規約確認を行います。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="運用上のガードレール"
        description="無料枠で準備できる範囲と、公開前に人間が確認すべき範囲を分けます。"
      >
        <SimpleList items={MONETIZATION_GUARDRAILS} />
      </Section>

      <Section title="表示を開始する前に確認すること">
        <SimpleList
          items={[
            "ホスティングサービスの商用利用条件",
            "広告サービスまたはスポンサー契約の表示ルール",
            "利用規約、プライバシーポリシー、免責表示の整合性",
            "支援者や広告主が投稿審査へ関与しない運用手順",
          ]}
        />
      </Section>
    </>
  );
}
