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
    <div className="bg-background">
      <section className="border-b border-[#21342f] bg-[#17241f] text-white">
        <Container>
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-white/55">
                ADMIN CONSOLE
              </p>
              <h1 className="mt-2 text-2xl font-bold">入店前チェック東京</h1>
              <p className="mt-1 text-sm text-white/65">{adminUser.email}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                href="/admin"
              >
                概況
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                href="/admin/reports"
              >
                投稿
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                href="/admin/objections"
              >
                異議申立て
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                href="/admin/data"
              >
                初期データ
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                href="/admin/social"
              >
                SNS
              </Link>
              <form action={signOutAdminAction}>
                <button
                  className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
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
