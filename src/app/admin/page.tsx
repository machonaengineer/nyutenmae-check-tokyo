import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { PageHeader, Section } from "@/components/page-blocks";
import { formatDate } from "@/lib/format";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { getAdminDashboardMetrics } from "@/lib/admin/data";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "管理画面ログイン",
  description: "入店前チェック東京の管理者ログイン画面です。",
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const adminUser = await getCurrentAdminUser();
  const { error } = await searchParams;

  if (adminUser) {
    const metrics = await getAdminDashboardMetrics();

    return (
      <AdminShell adminUser={adminUser}>
        <Section
          title="管理概況"
          description="投稿審査、異議申立て、公開情報、初期データ運用の状態を確認します。"
        >
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: "全投稿", value: metrics.reportsTotal },
              { label: "審査待ち", value: metrics.pendingReports },
              { label: "7日超の未審査", value: metrics.stalePendingReports },
              { label: "公開場所", value: metrics.publicPlaces },
              { label: "異議申立て", value: metrics.objectionsTotal },
              { label: "未確認申立て", value: metrics.pendingObjections },
              { label: "証拠ファイル", value: metrics.evidenceFiles },
              { label: "外部評価公開候補", value: metrics.externalRatingsPublic },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-line bg-white p-4 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
                <p className="text-xs font-semibold text-muted">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">次に見る画面</h2>
              <div className="mt-4 grid gap-3">
                <AdminLink href="/admin/reports?status=pending" label="審査待ち投稿を見る" />
                <AdminLink href="/admin/objections" label="異議申立てを見る" />
                <AdminLink href="/admin/data" label="初期データCSVを検証する" />
                <AdminLink href="/admin/research" label="調査キューを見る" />
                <AdminLink href="/admin/social" label="SNS文面を確認する" />
              </div>
            </div>

            <div className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">エリア別投稿数</h2>
              {metrics.reportsByArea.length > 0 ? (
                <dl className="mt-4 grid gap-2 text-sm">
                  {metrics.reportsByArea.slice(0, 8).map((area) => (
                    <div key={area.areaName} className="flex items-center justify-between gap-3">
                      <dt className="text-muted">{area.areaName}</dt>
                      <dd className="font-bold text-ink">{area.count}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 text-sm text-muted">投稿データはまだありません。</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">最近の管理操作</h2>
            {metrics.latestActions.length > 0 ? (
              <div className="mt-4 divide-y divide-line">
                {metrics.latestActions.map((action) => (
                  <div key={action.id} className="grid gap-2 py-3 text-sm md:grid-cols-[160px_1fr_auto]">
                    <span className="font-semibold text-ink">{action.action}</span>
                    <span className="text-muted">{action.summary ?? "詳細なし"}</span>
                    <span className="text-muted">{formatDate(action.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">管理操作ログはまだありません。</p>
            )}
          </div>
        </Section>
      </AdminShell>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="管理画面ログイン"
        description="管理画面はSupabase Authでログインし、ADMIN_EMAILSに含まれるメールアドレスだけが利用できます。"
      />
      <Section title="ログイン">
        {error === "unauthorized" ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            管理者として確認できませんでした。許可済みメールアドレスでログインしてください。
          </div>
        ) : null}
        <AdminLoginForm />
      </Section>
    </>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
      href={href}
    >
      {label}
    </Link>
  );
}
