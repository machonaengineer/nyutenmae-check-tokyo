import type { Metadata } from "next";
import { SITE } from "@/lib/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  imageLabel?: string;
  index?: boolean;
};

export function getOgImagePath(title: string, label = "料金確認・明細確認・相談先確認") {
  const params = new URLSearchParams({
    title,
    label,
  });

  return `/og?${params.toString()}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  imageLabel,
  index = true,
}: PageMetadataOptions): Metadata {
  const image = getOgImagePath(title, imageLabel);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      siteName: SITE.name,
      type: "website",
      locale: "ja_JP",
      url: `${SITE.url}${path}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: index
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
  };
}

export function createNoIndexMetadata(title: string): Metadata {
  return createPageMetadata({
    title,
    description:
      "このページは管理、送信完了、または非公開確認用のため検索エンジンへの掲載対象外です。",
    path: "/",
    index: false,
  });
}
