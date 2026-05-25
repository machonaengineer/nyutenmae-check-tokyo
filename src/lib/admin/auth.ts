import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseCookieServerClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
};

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  let supabase;

  try {
    supabase = await createSupabaseCookieServerClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email || !isAllowedAdminEmail(data.user.email)) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export async function requireAdminUser() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    redirect("/admin?error=unauthorized");
  }

  return adminUser;
}
