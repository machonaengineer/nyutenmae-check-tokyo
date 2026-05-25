import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ObjectionStatusForm } from "@/components/admin/objection-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/page-blocks";
import { formatDate } from "@/lib/format";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminObjections } from "@/lib/admin/data";

type AdminObjectionsPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "異議申立て管理",
  description: "異議申立てを確認する画面です。",
};

export const dynamic = "force-dynamic";

export default async function AdminObjectionsPage({
  searchParams,
}: AdminObjectionsPageProps) {
  const adminUser = await requireAdminUser();
  const query = await searchParams;
  const objections = await getAdminObjections();

  return (
    <AdminShell adminUser={adminUser}>
      <Section
        title="異議申立て"
        description="掲載内容への確認依頼、修正依頼、権利侵害の懸念を確認します。"
      >
        {query.saved ? (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            更新しました。
          </div>
        ) : null}
        {query.error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            処理に失敗しました。
          </div>
        ) : null}

        {objections.length > 0 ? (
          <div className="grid gap-4">
            {objections.map((objection) => (
              <article key={objection.id} className="rounded-md border border-line bg-surface p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={objection.status} type="objection" />
                      <span className="text-xs text-muted">{formatDate(objection.createdAt)}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-ink">
                      {objection.reasonCategory}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{objection.requesterEmail}</p>
                    {objection.reportId ? (
                      <Link
                        className="mt-2 inline-flex text-sm font-semibold text-action"
                        href={`/admin/reports/${objection.reportId}`}
                      >
                        対象投稿を開く
                      </Link>
                    ) : null}
                    {objection.targetUrl ? (
                      <p className="mt-2 break-all text-sm text-muted">{objection.targetUrl}</p>
                    ) : null}
                  </div>
                  <ObjectionStatusForm objectionId={objection.id} status={objection.status} />
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink">
                  {objection.details}
                </p>
                {objection.privateNote ? (
                  <p className="mt-4 rounded-md border border-line bg-paper p-3 text-sm leading-6 text-muted">
                    {objection.privateNote}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="異議申立てはまだありません。" />
        )}
      </Section>
    </AdminShell>
  );
}
