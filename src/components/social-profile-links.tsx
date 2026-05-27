import { getSocialProfileLinks } from "@/lib/social";

export function SocialProfileLinks() {
  const links = getSocialProfileLinks();

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.href}
          className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
          href={link.href}
          rel="noreferrer"
          target="_blank"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
