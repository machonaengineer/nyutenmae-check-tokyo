import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/site-shell";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
};

export function PageHeader({
  eyebrow,
  title,
  description,
  primaryAction,
}: PageHeaderProps) {
  return (
    <section className="border-b border-line bg-surface">
      <Container>
        <div className="grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 text-sm font-semibold text-action">{eyebrow}</p>
            ) : null}
            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-8 text-muted sm:text-lg">{description}</p>
          </div>
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="inline-flex h-11 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            >
              {primaryAction.label}
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 max-w-3xl">
          <h2 className="text-2xl font-bold leading-tight text-ink">{title}</h2>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function PolicyNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-caution bg-caution-soft px-4 py-3 text-sm leading-7 text-ink">
      {children}
    </div>
  );
}

export function SimpleList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-line bg-surface px-4 py-3 text-sm leading-6">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DefinitionList({
  items,
}: {
  items: readonly { label: string; description: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className="rounded-md border border-line bg-surface p-5">
          <h3 className="text-base font-bold text-ink">{item.label}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
