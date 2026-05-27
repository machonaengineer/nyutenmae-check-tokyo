import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminSponsorInquiries } from "@/lib/admin/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "スポンサー問い合わせ",
  description: "スポンサー、広告、支援、連携の問い合わせを確認する管理画面です。",
};

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  const adminUser = await requireAdminUser();
  const inquiries = await getAdminSponsorInquiries();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="スポンサー問い合わせ"
        description="掲載独立性と法務確認を前提に、問い合わせ内容を確認します。公開ページには表示されません。"
      >
        {inquiries.length > 0 ? (
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-md border border-line bg-white p-5 shadow-[0_10px_28px_rgb(23_32_42/0.05)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted">
                      {formatDate(inquiry.createdAt)}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-ink">
                      {inquiry.organizationName || "組織名未入力"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{inquiry.contactEmail}</p>
                    {inquiry.websiteUrl ? (
                      <a
                        className="mt-2 inline-flex break-all text-sm font-semibold text-action"
                        href={inquiry.websiteUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Webサイトを確認する
                      </a>
                    ) : null}
                  </div>
                  <div className="grid gap-2 text-sm text-muted">
                    <p>種別: {inquiry.sponsorType}</p>
                    <p>予算: {inquiry.budgetRange}</p>
                    {inquiry.contactName ? <p>担当: {inquiry.contactName}</p> : null}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink">
                  {inquiry.message}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="スポンサー問い合わせはまだありません。" />
        )}
      </Section>
    </AdminShell>
  );
}
