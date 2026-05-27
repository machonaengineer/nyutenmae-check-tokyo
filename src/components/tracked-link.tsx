"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@vercel/analytics";
import type { AnalyticsEventName } from "@/lib/analytics-events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: AnalyticsEventName;
  eventProperties?: Record<string, boolean | number | string>;
};

export function TrackedLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED === "true") {
          track(eventName, eventProperties);
        }

        onClick?.(event);
      }}
    />
  );
}
