import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/site-shell";
import type { AdminUser } from "@/lib/admin/auth";
import { signOutAdminAction } from "@/app/admin/actions";

export function AdminShell({
  adminUser,
  children,
}: {
  adminUser: AdminUser;
  children: ReactNode;
}) {
  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-ink text-white">
        <Container>
          <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/70">管理画面</p>
              <h1 className="text-2xl font-bold">入店前チェック東京</h1>
              <p className="mt-1 text-sm text-white/70">{adminUser.email}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-white/10"
                href="/admin/reports"
              >
                投稿
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-white/10"
                href="/admin/objections"
              >
                異議申立て
              </Link>
              <form action={signOutAdminAction}>
                <button
                  className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  type="submit"
                >
                  ログアウト
                </button>
              </form>
            </nav>
          </div>
        </Container>
      </section>
      {children}
    </div>
  );
}
