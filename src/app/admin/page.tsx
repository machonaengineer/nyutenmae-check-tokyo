import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { PageHeader, Section } from "@/components/page-blocks";
import { getCurrentAdminUser } from "@/lib/admin/auth";

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

  if (adminUser) {
    redirect("/admin/reports");
  }

  const { error } = await searchParams;

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
